"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requireCurrentUser } from "@/lib/auth/session"
import { assertOwned } from "@/lib/db/with-ownership"
import { generateOutreachDraft as runOutreachDraftTask } from "@/lib/ai/tasks/generate-outreach-draft"

export async function getMyApplication(opportunityId: string) {
  const user = await requireCurrentUser()
  assertOwned(await prisma.opportunity.findUnique({ where: { id: opportunityId } }), user.id)
  return prisma.application.findFirst({
    where: { userId: user.id, opportunityId },
    orderBy: { createdAt: "desc" },
  })
}

type DraftResult = { ok: true; applicationId: string } | { ok: false; message: string }

export async function generateOutreachDraft(opportunityId: string): Promise<DraftResult> {
  const user = await requireCurrentUser()
  const opportunity = assertOwned(await prisma.opportunity.findUnique({ where: { id: opportunityId } }), user.id)

  const [profile, evidence, latestFitAssessment] = await Promise.all([
    prisma.candidateProfile.findUnique({ where: { userId: user.id } }),
    prisma.evidence.findMany({
      where: { userId: user.id, verificationStatus: { in: ["verified", "edited"] }, isReusableInOutreach: true },
      take: 15,
    }),
    prisma.fitAssessment.findFirst({ where: { userId: user.id, opportunityId }, orderBy: { createdAt: "desc" } }),
  ])

  if (evidence.length === 0) {
    return { ok: false, message: "Добавьте хотя бы одно доказательство, помеченное «Использовать в письмах»." }
  }

  const angle =
    latestFitAssessment && typeof latestFitAssessment.recommendedActions === "object"
      ? (latestFitAssessment.recommendedActions as Record<string, unknown>).outreachAngle
      : null

  const promptContent = [
    `## Opportunity`,
    `${opportunity.title} at ${opportunity.companyName}`,
    opportunity.notes ? `Context: ${opportunity.notes}` : null,
    ``,
    `## Candidate profile`,
    profile?.careerChangeReason ? `Why looking now: ${profile.careerChangeReason}` : null,
    profile?.headline ? `Positioning: ${profile.headline}` : null,
    ``,
    typeof angle === "string" ? `## Suggested angle (from an existing fit assessment)\n${angle}\n` : null,
    `## Evidence (id: title — result)`,
    evidence
      .map((e) => `- ${e.id}: ${e.title} — ${e.result ?? e.action ?? ""}${e.metricValue !== null ? ` (${e.metricValue} ${e.metricUnit ?? ""})` : ""}`)
      .join("\n"),
  ]
    .filter((line) => line !== null)
    .join("\n")

  const result = await runOutreachDraftTask(user.id, opportunityId, promptContent)
  if (!result.ok) {
    return { ok: false, message: result.message }
  }

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      opportunityId,
      channel: "direct_apply",
      messageDraft: result.data.draft,
    },
  })

  revalidatePath(`/opportunities/${opportunityId}`)
  return { ok: true, applicationId: application.id }
}

export async function updateMessageFinal(applicationId: string, text: string) {
  const user = await requireCurrentUser()
  const application = assertOwned(await prisma.application.findUnique({ where: { id: applicationId } }), user.id)

  await prisma.application.update({ where: { id: applicationId }, data: { messageFinal: text } })
  revalidatePath(`/opportunities/${application.opportunityId}`)
  return { ok: true as const }
}
