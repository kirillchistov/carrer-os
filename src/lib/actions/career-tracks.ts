"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requireCurrentUser } from "@/lib/auth/session"
import { assertOwned, ownedWhere } from "@/lib/db/with-ownership"
import { careerTrackFormSchema, type CareerTrackFormValues } from "@/lib/validation/career-track"
import { draftPositioning } from "@/lib/ai/tasks/draft-positioning"
import { track } from "@/lib/analytics/track"

export async function listMyCareerTracks() {
  const user = await requireCurrentUser()
  return prisma.careerTrack.findMany({
    where: ownedWhere(user.id),
    orderBy: { createdAt: "asc" },
  })
}

export async function getCareerTrack(id: string) {
  const user = await requireCurrentUser()
  return assertOwned(await prisma.careerTrack.findUnique({ where: { id } }), user.id)
}

export async function createCareerTrack(values: CareerTrackFormValues) {
  const user = await requireCurrentUser()
  const data = careerTrackFormSchema.parse(values)

  const trackCount = await prisma.careerTrack.count({ where: ownedWhere(user.id) })
  if (trackCount >= 3) {
    throw new Error("В MVP можно создать не более 3 карьерных треков.")
  }

  const careerTrack = await prisma.careerTrack.create({ data: { userId: user.id, ...data } })
  track("career_track_created", user.id, { careerTrackId: careerTrack.id })

  revalidatePath("/tracks")
  return careerTrack
}

export async function updateCareerTrack(id: string, values: CareerTrackFormValues) {
  const user = await requireCurrentUser()
  assertOwned(await prisma.careerTrack.findUnique({ where: { id } }), user.id)

  const data = careerTrackFormSchema.parse(values)
  await prisma.careerTrack.update({ where: { id }, data })

  revalidatePath("/tracks")
  return { ok: true as const }
}

export async function deleteCareerTrack(id: string) {
  const user = await requireCurrentUser()
  assertOwned(await prisma.careerTrack.findUnique({ where: { id } }), user.id)

  await prisma.careerTrack.delete({ where: { id } })
  revalidatePath("/tracks")
  return { ok: true as const }
}

export async function requestPositioningDraft(id: string) {
  const user = await requireCurrentUser()
  const careerTrack = assertOwned(await prisma.careerTrack.findUnique({ where: { id } }), user.id)

  const evidence = await prisma.evidence.findMany({
    where: { userId: user.id, careerTrackId: id },
    select: { title: true, result: true, metricValue: true, metricUnit: true },
    take: 10,
  })

  const inputSummary = [
    `Целевая роль: ${careerTrack.title}`,
    careerTrack.businessProblems.length > 0
      ? `Решаемые бизнес-задачи: ${careerTrack.businessProblems.join("; ")}`
      : null,
    careerTrack.mustHaveSkills.length > 0 ? `Ключевые компетенции: ${careerTrack.mustHaveSkills.join(", ")}` : null,
    evidence.length > 0
      ? `Релевантные доказательства:\n${evidence
          .map((e) => `- ${e.title}${e.result ? `: ${e.result}` : ""}${e.metricValue !== null ? ` (${e.metricValue} ${e.metricUnit ?? ""})` : ""}`)
          .join("\n")}`
      : "Релевантные доказательства пока не привязаны к этому треку.",
  ]
    .filter(Boolean)
    .join("\n\n")

  return draftPositioning(user.id, id, inputSummary)
}
