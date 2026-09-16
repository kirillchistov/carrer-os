"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requireCurrentUser } from "@/lib/auth/session"
import { assertOwned } from "@/lib/db/with-ownership"
import { interviewFormSchema, type InterviewFormValues } from "@/lib/validation/interview"
import {
  interviewLearningsResultSchema,
  type InterviewEvidenceDraft,
  type InterviewLearningsResult,
} from "@/lib/validation/interview-learning"
import { generateInterviewLearnings as runInterviewLearningsTask } from "@/lib/ai/tasks/generate-interview-learnings"
import { computeEvidenceQualityScore } from "@/lib/evidence/quality-score"
import { track } from "@/lib/analytics/track"
import { questionsToJson } from "@/lib/interviews/questions-format"

export async function listInterviews(opportunityId: string) {
  const user = await requireCurrentUser()
  assertOwned(await prisma.opportunity.findUnique({ where: { id: opportunityId } }), user.id)
  return prisma.interview.findMany({ where: { userId: user.id, opportunityId }, orderBy: { date: "desc" } })
}

export async function getInterview(id: string) {
  const user = await requireCurrentUser()
  const interview = assertOwned(await prisma.interview.findUnique({ where: { id } }), user.id)
  const opportunity = await prisma.opportunity.findUniqueOrThrow({
    where: { id: interview.opportunityId },
    select: { id: true, title: true, companyName: true },
  })
  return { interview, opportunity }
}

export async function createInterview(opportunityId: string, values: InterviewFormValues) {
  const user = await requireCurrentUser()
  assertOwned(await prisma.opportunity.findUnique({ where: { id: opportunityId } }), user.id)

  const data = interviewFormSchema.parse(values)
  const interview = await prisma.interview.create({
    data: {
      userId: user.id,
      opportunityId,
      date: new Date(data.date),
      stage: data.stage,
      interviewerName: data.interviewerName,
      interviewerTitle: data.interviewerTitle,
      questions: questionsToJson(data.questions),
      notes: data.notes,
      feedback: data.feedback,
      interestSignals: data.interestSignals,
      objections: data.objections,
      agreements: data.agreements,
      nextStep: data.nextStep,
      nextStepAt: data.nextStepAt ? new Date(data.nextStepAt) : null,
    },
  })

  track("interview_note_created", user.id, { interviewId: interview.id, opportunityId })
  revalidatePath(`/opportunities/${opportunityId}`)
  return interview
}

export async function updateInterview(id: string, values: InterviewFormValues) {
  const user = await requireCurrentUser()
  const interview = assertOwned(await prisma.interview.findUnique({ where: { id } }), user.id)

  const data = interviewFormSchema.parse(values)
  await prisma.interview.update({
    where: { id },
    data: {
      date: new Date(data.date),
      stage: data.stage,
      interviewerName: data.interviewerName,
      interviewerTitle: data.interviewerTitle,
      questions: questionsToJson(data.questions),
      notes: data.notes,
      feedback: data.feedback,
      interestSignals: data.interestSignals,
      objections: data.objections,
      agreements: data.agreements,
      nextStep: data.nextStep,
      nextStepAt: data.nextStepAt ? new Date(data.nextStepAt) : null,
    },
  })

  revalidatePath(`/interviews/${id}`)
  revalidatePath(`/opportunities/${interview.opportunityId}`)
  return { ok: true as const }
}

export async function deleteInterview(id: string) {
  const user = await requireCurrentUser()
  const interview = assertOwned(await prisma.interview.findUnique({ where: { id } }), user.id)

  await prisma.interview.delete({ where: { id } })
  revalidatePath(`/opportunities/${interview.opportunityId}`)
  return { ok: true as const, opportunityId: interview.opportunityId }
}

type LearningsResult = { ok: true; data: InterviewLearningsResult } | { ok: false; message: string }

export async function getLatestInterviewLearnings(interviewId: string): Promise<InterviewLearningsResult | null> {
  const user = await requireCurrentUser()
  assertOwned(await prisma.interview.findUnique({ where: { id: interviewId } }), user.id)

  const run = await prisma.aiRun.findFirst({
    where: {
      userId: user.id,
      type: "interview_learning",
      status: "success",
      inputEntityIds: { path: ["interviewId"], equals: interviewId },
    },
    orderBy: { createdAt: "desc" },
  })
  if (!run?.output) return null

  const parsed = interviewLearningsResultSchema.safeParse(run.output)
  return parsed.success ? parsed.data : null
}

export async function requestInterviewLearnings(interviewId: string): Promise<LearningsResult> {
  const user = await requireCurrentUser()
  const interview = assertOwned(await prisma.interview.findUnique({ where: { id: interviewId } }), user.id)
  const opportunity = await prisma.opportunity.findUniqueOrThrow({
    where: { id: interview.opportunityId },
    select: { title: true, companyName: true },
  })

  const promptContent = [
    `## Interview`,
    `${opportunity.title} at ${opportunity.companyName} — stage: ${interview.stage}`,
    interview.interviewerName ? `Interviewer: ${interview.interviewerName}${interview.interviewerTitle ? ` (${interview.interviewerTitle})` : ""}` : null,
    Array.isArray(interview.questions) && interview.questions.length > 0
      ? `Questions asked:\n${(interview.questions as string[]).map((q) => `- ${q}`).join("\n")}`
      : null,
    interview.notes ? `## Notes (what the candidate said/discussed)\n${interview.notes}` : null,
    interview.feedback ? `## Feedback received\n${interview.feedback}` : null,
    interview.interestSignals ? `## Interest signals\n${interview.interestSignals}` : null,
    interview.objections ? `## Objections raised\n${interview.objections}` : null,
    interview.agreements ? `## Agreements made\n${interview.agreements}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n\n")

  const result = await runInterviewLearningsTask(user.id, interviewId, promptContent)
  if (!result.ok) {
    return { ok: false, message: result.message }
  }

  revalidatePath(`/interviews/${interviewId}`)
  return { ok: true, data: result.data }
}

export async function applyEvidenceDraft(draft: InterviewEvidenceDraft, interviewId: string) {
  const user = await requireCurrentUser()
  assertOwned(await prisma.interview.findUnique({ where: { id: interviewId } }), user.id)

  const { score, explanation } = computeEvidenceQualityScore({
    situation: draft.situation,
    task: draft.task,
    action: draft.action,
    result: draft.result,
    metricValue: draft.metricValue,
  })

  const evidence = await prisma.evidence.create({
    data: {
      userId: user.id,
      title: draft.title,
      situation: draft.situation,
      task: draft.task,
      action: draft.action,
      result: draft.result,
      metricValue: draft.metricValue,
      metricUnit: draft.metricUnit,
      skills: draft.skills,
      industries: draft.industries,
      sourceType: "interview_note",
      sourceReference: interviewId,
      verificationStatus: "unverified",
      qualityScore: score,
      qualityExplanation: explanation,
    },
  })

  track("evidence_created", user.id, { evidenceId: evidence.id, source: "interview_learning" })
  revalidatePath("/evidence")
  return evidence
}

export async function applyCareerTrackSuggestion(
  careerTrackId: string,
  field: "businessProblems" | "mustHaveSkills" | "targetIndustries",
  value: string
) {
  const user = await requireCurrentUser()
  const careerTrack = assertOwned(await prisma.careerTrack.findUnique({ where: { id: careerTrackId } }), user.id)

  const current = careerTrack[field]
  if (current.includes(value)) return { ok: true as const }

  await prisma.careerTrack.update({
    where: { id: careerTrackId },
    data: { [field]: [...current, value] },
  })

  revalidatePath("/tracks")
  return { ok: true as const }
}
