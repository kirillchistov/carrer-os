"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requireCurrentUser } from "@/lib/auth/session"
import { assertOwned, ownedWhere } from "@/lib/db/with-ownership"
import { evidenceFormSchema, type EvidenceFormValues } from "@/lib/validation/evidence"
import { computeEvidenceQualityScore } from "@/lib/evidence/quality-score"
import { suggestEvidenceGaps } from "@/lib/ai/tasks/suggest-evidence-gaps"
import { track } from "@/lib/analytics/track"

export async function listMyEvidence() {
  const user = await requireCurrentUser()
  return prisma.evidence.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getEvidence(id: string) {
  const user = await requireCurrentUser()
  const evidence = await prisma.evidence.findUnique({ where: { id } })
  return assertOwned(evidence, user.id)
}

function withQualityScore(values: EvidenceFormValues) {
  const { score, explanation } = computeEvidenceQualityScore(values)
  return { qualityScore: score, qualityExplanation: explanation }
}

export async function createEvidence(values: EvidenceFormValues) {
  const user = await requireCurrentUser()
  const data = evidenceFormSchema.parse(values)

  const evidence = await prisma.evidence.create({
    data: {
      userId: user.id,
      sourceType: "manual_entry",
      verificationStatus: "verified",
      ...data,
      ...withQualityScore(data),
    },
  })

  track("evidence_created", user.id, { evidenceId: evidence.id })
  revalidatePath("/evidence")
  return evidence
}

export async function updateEvidence(id: string, values: EvidenceFormValues) {
  const user = await requireCurrentUser()
  assertOwned(await prisma.evidence.findUnique({ where: { id } }), user.id)

  const data = evidenceFormSchema.parse(values)

  await prisma.evidence.update({
    where: { id },
    data: { ...data, ...withQualityScore(data) },
  })

  revalidatePath("/evidence")
  return { ok: true as const }
}

export async function deleteEvidence(id: string) {
  const user = await requireCurrentUser()
  assertOwned(await prisma.evidence.findUnique({ where: { id } }), user.id)

  await prisma.evidence.delete({ where: { id } })
  revalidatePath("/evidence")
  return { ok: true as const }
}

export async function requestEvidenceGapSuggestions(id: string) {
  const user = await requireCurrentUser()
  const evidence = assertOwned(await prisma.evidence.findUnique({ where: { id } }), user.id)

  const cardText = [
    `Ситуация: ${evidence.situation ?? "(не указано)"}`,
    `Задача: ${evidence.task ?? "(не указано)"}`,
    `Действия: ${evidence.action ?? "(не указано)"}`,
    `Результат: ${evidence.result ?? "(не указано)"}`,
    evidence.metricValue !== null
      ? `Метрика: ${evidence.metricValue} ${evidence.metricUnit ?? ""}`
      : "Метрика: (не указано)",
  ].join("\n")

  return suggestEvidenceGaps(user.id, id, cardText)
}

export async function listCareerTrackOptions() {
  const user = await requireCurrentUser()
  return prisma.careerTrack.findMany({
    where: ownedWhere(user.id),
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  })
}

export async function listExperienceOptions() {
  const user = await requireCurrentUser()
  return prisma.experience.findMany({
    where: { userId: user.id, verificationStatus: { in: ["verified", "edited"] } },
    select: { id: true, title: true, companyName: true },
    orderBy: { startDate: "desc" },
  })
}
