"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requireCurrentUser } from "@/lib/auth/session"
import { assertOwned } from "@/lib/db/with-ownership"
import { computeDeterministicSignals } from "@/lib/fit/deterministic-signals"
import { sanitizeFitAssessmentResult } from "@/lib/fit/sanitize-result"
import { generateFitAssessment as runFitAssessmentTask } from "@/lib/ai/tasks/generate-fit-assessment"
import { track } from "@/lib/analytics/track"

export async function listCareerTracksForFit() {
  const user = await requireCurrentUser()
  return prisma.careerTrack.findMany({
    where: { userId: user.id, active: true },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  })
}

export async function getLatestFitAssessment(opportunityId: string, careerTrackId: string) {
  const user = await requireCurrentUser()
  return prisma.fitAssessment.findFirst({
    where: { userId: user.id, opportunityId, careerTrackId },
    orderBy: { createdAt: "desc" },
  })
}

type GenerateResult =
  | { ok: true; fitAssessmentId: string }
  | { ok: false; message: string }

export async function generateFitAssessment(opportunityId: string, careerTrackId: string): Promise<GenerateResult> {
  const user = await requireCurrentUser()

  const opportunity = assertOwned(await prisma.opportunity.findUnique({ where: { id: opportunityId } }), user.id)
  const careerTrack = assertOwned(await prisma.careerTrack.findUnique({ where: { id: careerTrackId } }), user.id)

  const [requirements, profile, evidence, skills] = await Promise.all([
    prisma.opportunityRequirement.findMany({ where: { opportunityId } }),
    prisma.candidateProfile.findUnique({ where: { userId: user.id } }),
    prisma.evidence.findMany({
      where: { userId: user.id, careerTrackId, verificationStatus: { in: ["verified", "edited"] } },
    }),
    prisma.skill.findMany({ where: { userId: user.id, verificationStatus: { in: ["verified", "edited"] } } }),
  ])

  if (evidence.length === 0) {
    return {
      ok: false,
      message: "Для этого трека пока нет подтверждённых доказательств — добавьте хотя бы одно в Evidence Bank.",
    }
  }

  const signals = computeDeterministicSignals({
    opportunity: {
      employmentFormat: opportunity.employmentFormat,
      workMode: opportunity.workMode,
      location: opportunity.location,
    },
    requirements: requirements.map((r) => ({
      id: r.id,
      category: r.category,
      text: r.text,
      importance: r.importance,
      normalizedSkill: r.normalizedSkill,
    })),
    careerTrack: {
      employmentFormats: careerTrack.employmentFormats,
      targetIndustries: careerTrack.targetIndustries,
    },
    profile: profile ? { targetWorkModes: profile.targetWorkModes, targetLocations: profile.targetLocations } : null,
    skillNames: skills.map((s) => s.name),
    evidence: evidence.map((e) => ({ id: e.id, title: e.title, skills: e.skills, industries: e.industries, qualityScore: e.qualityScore })),
  })

  const promptContent = buildPromptContent({ opportunity, requirements, careerTrack, profile, evidence, signals })

  const result = await runFitAssessmentTask(user.id, { opportunityId, careerTrackId }, promptContent)
  if (!result.ok) {
    return { ok: false, message: result.message }
  }

  const sanitized = sanitizeFitAssessmentResult(
    result.data,
    new Set(evidence.map((e) => e.id)),
    new Set(requirements.map((r) => r.id))
  )

  const fitAssessment = await prisma.fitAssessment.create({
    data: {
      userId: user.id,
      opportunityId,
      careerTrackId,
      overallLabel: sanitized.overallLabel,
      overallScore: sanitized.overallScore,
      dimensionResults: sanitized.dimensions,
      gaps: sanitized.gapsAndRisks,
      questions: sanitized.questionsToValidate,
      recommendedActions: {
        whyYouFit: sanitized.whyYouFit,
        evidenceToEmphasize: sanitized.evidenceToEmphasize,
        resumeChangesRecommended: sanitized.resumeChangesRecommended,
        outreachAngle: sanitized.outreachAngle,
        nextBestAction: sanitized.nextBestAction,
      },
      aiRunId: result.aiRunId,
    },
  })

  track("fit_report_generated", user.id, { opportunityId, careerTrackId, fitAssessmentId: fitAssessment.id })
  revalidatePath(`/opportunities/${opportunityId}/fit`)
  return { ok: true, fitAssessmentId: fitAssessment.id }
}

function buildPromptContent({
  opportunity,
  requirements,
  careerTrack,
  profile,
  evidence,
  signals,
}: {
  opportunity: { title: string; companyName: string; rawDescription: string | null; notes: string | null }
  requirements: { id: string; category: string; text: string; importance: string }[]
  careerTrack: {
    title: string
    businessProblems: string[]
    mustHaveSkills: string[]
    valueProposition: string | null
  }
  profile: { nonNegotiables: string | null; openToLowerLevelIfScopeFits: boolean } | null
  evidence: { id: string; title: string; situation: string | null; action: string | null; result: string | null; metricValue: number | null; metricUnit: string | null }[]
  signals: ReturnType<typeof computeDeterministicSignals>
}): string {
  return [
    `## Opportunity`,
    `${opportunity.title} — ${opportunity.companyName}`,
    opportunity.notes ? `Summary: ${opportunity.notes}` : null,
    opportunity.rawDescription ? `Raw description:\n${opportunity.rawDescription.slice(0, 4000)}` : null,
    ``,
    `## Requirements (id: category [importance] text)`,
    requirements.map((r) => `- ${r.id}: ${r.category} [${r.importance}] ${r.text}`).join("\n") || "(none extracted)",
    ``,
    `## Candidate's career track`,
    `Title: ${careerTrack.title}`,
    `Business problems it targets: ${careerTrack.businessProblems.join("; ") || "(none stated)"}`,
    `Must-have skills: ${careerTrack.mustHaveSkills.join(", ") || "(none stated)"}`,
    careerTrack.valueProposition ? `Value proposition: ${careerTrack.valueProposition}` : null,
    profile?.nonNegotiables ? `Non-negotiables: ${profile.nonNegotiables}` : null,
    profile?.openToLowerLevelIfScopeFits ? `Candidate is open to a lower-level role if scope fits.` : null,
    ``,
    `## Evidence (id: title — situation/action/result/metric)`,
    evidence
      .map(
        (e) =>
          `- ${e.id}: ${e.title} — ${[e.situation, e.action, e.result].filter(Boolean).join(" / ")}${
            e.metricValue !== null ? ` (${e.metricValue} ${e.metricUnit ?? ""})` : ""
          }`
      )
      .join("\n"),
    ``,
    `## Confirmed facts (computed deterministically — do not contradict)`,
    `Employment format match: ${signals.employmentFormatMatch}`,
    `Work mode match: ${signals.workModeMatch}`,
    `Location match: ${signals.locationMatch}`,
    `Industry overlap: ${signals.industryOverlap}`,
    `Matched skill/tool requirements: ${signals.matchedSkillCount} of ${signals.matchedSkillCount + signals.missingSkillCount}`,
    `Evidence available for this track: ${signals.evidenceCountForTrack} (average quality score: ${signals.averageEvidenceQuality ?? "n/a"})`,
  ]
    .filter((line) => line !== null)
    .join("\n")
}
