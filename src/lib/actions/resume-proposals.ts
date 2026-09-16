"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requireCurrentUser } from "@/lib/auth/session"
import { assertOwned } from "@/lib/db/with-ownership"
import { resumeContentSchema, type ResumeContent } from "@/lib/validation/resume"
import { generateResumeProposals as runResumeProposalsTask } from "@/lib/ai/tasks/generate-resume-proposals"
import { sanitizeResumeProposals } from "@/lib/resumes/sanitize-proposals"
import { applyProposal } from "@/lib/resumes/apply-proposal"
import { track } from "@/lib/analytics/track"

type ProposalGenerationResult = { ok: true } | { ok: false; message: string }

export async function startResumeTailoring(resumeId: string, opportunityId: string): Promise<{ resumeVersionId: string }> {
  const user = await requireCurrentUser()
  const resume = assertOwned(await prisma.resume.findUnique({ where: { id: resumeId } }), user.id)
  const opportunity = assertOwned(await prisma.opportunity.findUnique({ where: { id: opportunityId } }), user.id)

  const contentParsed = resumeContentSchema.safeParse(resume.structuredContent)
  const content: ResumeContent = contentParsed.success
    ? contentParsed.data
    : { summary: "", experience: [], achievements: [], skills: [], education: [], certifications: [], projects: [] }

  const resumeVersion = await prisma.resumeVersion.create({
    data: {
      userId: user.id,
      resumeId,
      opportunityId,
      name: `${resume.name} — ${opportunity.companyName}`,
      language: resume.language,
      structuredContent: content,
      status: "draft",
    },
  })

  // Generation failure is surfaced on the version page (zero proposals → retry button),
  // not here — the ResumeVersion itself was created successfully, so the caller should
  // still navigate to it rather than being stranded in the dialog.
  await generateProposalsForVersion(user.id, resume.careerTrackId, resumeVersion, opportunity)

  revalidatePath(`/resumes/${resumeId}/versions/${resumeVersion.id}`)
  return { resumeVersionId: resumeVersion.id }
}

export async function regenerateResumeProposals(resumeVersionId: string): Promise<ProposalGenerationResult> {
  const user = await requireCurrentUser()
  const resumeVersion = assertOwned(await prisma.resumeVersion.findUnique({ where: { id: resumeVersionId } }), user.id)
  if (!resumeVersion.opportunityId) throw new Error("У этой версии резюме нет связанной возможности")

  const [resume, opportunity] = await Promise.all([
    prisma.resume.findUniqueOrThrow({ where: { id: resumeVersion.resumeId } }),
    assertOwned(await prisma.opportunity.findUnique({ where: { id: resumeVersion.opportunityId } }), user.id),
  ])

  const result = await generateProposalsForVersion(user.id, resume.careerTrackId, resumeVersion, opportunity)
  revalidatePath(`/resumes/${resumeVersion.resumeId}/versions/${resumeVersion.id}`)
  return result
}

async function generateProposalsForVersion(
  userId: string,
  careerTrackId: string | null,
  resumeVersion: { id: string; structuredContent: unknown },
  opportunity: { id: string; title: string; companyName: string }
): Promise<ProposalGenerationResult> {
  const [requirements, evidence, experiences, latestFitAssessment] = await Promise.all([
    prisma.opportunityRequirement.findMany({ where: { opportunityId: opportunity.id } }),
    prisma.evidence.findMany({
      where: { userId, verificationStatus: { in: ["verified", "edited"] }, isReusableInResume: true },
    }),
    prisma.experience.findMany({ where: { userId, verificationStatus: { in: ["verified", "edited"] } } }),
    careerTrackId
      ? prisma.fitAssessment.findFirst({
          where: { userId, opportunityId: opportunity.id, careerTrackId },
          orderBy: { createdAt: "desc" },
        })
      : null,
  ])

  const contentParsed = resumeContentSchema.safeParse(resumeVersion.structuredContent)
  const content: ResumeContent = contentParsed.success
    ? contentParsed.data
    : { summary: "", experience: [], achievements: [], skills: [], education: [], certifications: [], projects: [] }

  const promptContent = buildPromptContent({ content, requirements, evidence, experiences, opportunity, latestFitAssessment })
  const allowedIds = new Set([...evidence.map((e) => e.id), ...experiences.map((e) => e.id)])

  const result = await runResumeProposalsTask(userId, { resumeVersionId: resumeVersion.id, opportunityId: opportunity.id }, promptContent)
  if (!result.ok) {
    return { ok: false, message: result.message }
  }

  const sanitized = sanitizeResumeProposals(result.data.proposals, allowedIds)

  await prisma.resumeChangeProposal.createMany({
    data: sanitized.map((p) => ({
      resumeVersionId: resumeVersion.id,
      section: p.section,
      originalText: p.originalText,
      proposedText: p.proposedText,
      rationale: p.rationale,
      evidenceIds: p.evidenceIds,
      relatedRequirementIds: [],
      changeType: p.changeType,
      status: "proposed",
      aiRunId: result.aiRunId,
    })),
  })

  return { ok: true }
}

export async function getResumeVersionWithProposals(versionId: string) {
  const user = await requireCurrentUser()
  const resumeVersion = assertOwned(await prisma.resumeVersion.findUnique({ where: { id: versionId } }), user.id)
  const proposals = await prisma.resumeChangeProposal.findMany({
    where: { resumeVersionId: versionId },
    orderBy: { createdAt: "asc" },
  })
  const content = resumeContentSchema.safeParse(resumeVersion.structuredContent)
  return {
    resumeVersion,
    proposals,
    content: content.success ? content.data : null,
  }
}

export async function resolveProposal(
  proposalId: string,
  action: "accept" | "reject",
  editedText?: string
) {
  const user = await requireCurrentUser()
  const proposal = await prisma.resumeChangeProposal.findUnique({ where: { id: proposalId } })
  if (!proposal) throw new Error("Предложение не найдено")

  const resumeVersion = assertOwned(
    await prisma.resumeVersion.findUnique({ where: { id: proposal.resumeVersionId } }),
    user.id
  )

  if (action === "reject") {
    await prisma.resumeChangeProposal.update({ where: { id: proposalId }, data: { status: "rejected" } })
    revalidatePath(`/resumes/${resumeVersion.resumeId}/versions/${resumeVersion.id}`)
    return { ok: true as const }
  }

  const finalText = editedText ?? proposal.proposedText
  const contentParsed = resumeContentSchema.safeParse(resumeVersion.structuredContent)
  if (!contentParsed.success) throw new Error("Некорректное содержимое резюме")

  const nextContent = applyProposal(contentParsed.data, {
    section: proposal.section,
    changeType: proposal.changeType,
    originalText: proposal.originalText,
    proposedText: finalText,
  })

  await prisma.$transaction([
    prisma.resumeVersion.update({ where: { id: resumeVersion.id }, data: { structuredContent: nextContent } }),
    prisma.resumeChangeProposal.update({
      where: { id: proposalId },
      data: {
        status: editedText && editedText !== proposal.proposedText ? "edited" : "accepted",
        finalText,
      },
    }),
  ])

  track("resume_change_accepted", user.id, { proposalId, resumeVersionId: resumeVersion.id })
  revalidatePath(`/resumes/${resumeVersion.resumeId}/versions/${resumeVersion.id}`)
  return { ok: true as const }
}

function buildPromptContent({
  content,
  requirements,
  evidence,
  experiences,
  opportunity,
  latestFitAssessment,
}: {
  content: ResumeContent
  requirements: { id: string; category: string; importance: string; text: string }[]
  evidence: { id: string; title: string; result: string | null; action: string | null; metricValue: number | null; metricUnit: string | null }[]
  experiences: { id: string; title: string; companyName: string; responsibilities: string[] }[]
  opportunity: { title: string; companyName: string }
  latestFitAssessment: { gaps: unknown; recommendedActions: unknown } | null
}): string {
  const fitContext =
    latestFitAssessment && typeof latestFitAssessment.recommendedActions === "object"
      ? JSON.stringify(latestFitAssessment.recommendedActions)
      : null

  return [
    `## Target opportunity`,
    `${opportunity.title} at ${opportunity.companyName}`,
    ``,
    `## Requirements (id: category [importance] text)`,
    requirements.map((r) => `- ${r.id}: ${r.category} [${r.importance}] ${r.text}`).join("\n") || "(none)",
    ``,
    fitContext ? `## Existing fit assessment context\n${fitContext}\n` : null,
    `## Current resume content`,
    `Summary: ${content.summary || "(empty)"}`,
    `Skills: ${content.skills.join(", ") || "(empty)"}`,
    `Achievements: ${content.achievements.join("; ") || "(empty)"}`,
    `Experience entries:`,
    content.experience
      .map((e, i) => `  [${i}] ${e.title} at ${e.company} (${e.period}): ${e.bullets.join(" | ") || "(no bullets)"}`)
      .join("\n") || "  (none)",
    ``,
    `## Candidate's evidence (id: title — result)`,
    evidence.map((e) => `- ${e.id}: ${e.title} — ${e.result ?? e.action ?? ""}${e.metricValue !== null ? ` (${e.metricValue} ${e.metricUnit ?? ""})` : ""}`).join("\n") || "(none)",
    ``,
    `## Candidate's verified experience (id: title at company — responsibilities)`,
    experiences.map((e) => `- ${e.id}: ${e.title} at ${e.companyName} — ${e.responsibilities.join("; ")}`).join("\n") || "(none)",
  ]
    .filter((line) => line !== null)
    .join("\n")
}
