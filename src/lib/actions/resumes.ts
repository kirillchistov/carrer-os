"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requireCurrentUser } from "@/lib/auth/session"
import { assertOwned, ownedWhere } from "@/lib/db/with-ownership"
import {
  createResumeSchema,
  resumeContentSchema,
  emptyResumeContent,
  type CreateResumeValues,
  type ResumeContent,
} from "@/lib/validation/resume"

export async function listMyResumes() {
  const user = await requireCurrentUser()
  return prisma.resume.findMany({ where: ownedWhere(user.id), orderBy: { updatedAt: "desc" } })
}

export async function getResume(id: string) {
  const user = await requireCurrentUser()
  const resume = assertOwned(await prisma.resume.findUnique({ where: { id } }), user.id)
  const parsed = resumeContentSchema.safeParse(resume.structuredContent)
  return { resume, content: parsed.success ? parsed.data : emptyResumeContent }
}

export async function createResume(values: CreateResumeValues) {
  const user = await requireCurrentUser()
  const data = createResumeSchema.parse(values)

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      careerTrackId: data.careerTrackId,
      name: data.name,
      language: data.language,
      isBase: true,
      structuredContent: emptyResumeContent,
    },
  })

  revalidatePath("/resumes")
  return resume
}

export async function createResumeFromProfile(values: CreateResumeValues) {
  const user = await requireCurrentUser()
  const data = createResumeSchema.parse(values)

  const [experiences, evidence, skills] = await Promise.all([
    prisma.experience.findMany({
      where: { userId: user.id, verificationStatus: { in: ["verified", "edited"] } },
      orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }],
    }),
    prisma.evidence.findMany({
      where: {
        userId: user.id,
        isReusableInResume: true,
        ...(data.careerTrackId ? { careerTrackId: data.careerTrackId } : {}),
      },
    }),
    prisma.skill.findMany({ where: { userId: user.id, verificationStatus: { in: ["verified", "edited"] } } }),
  ])

  const fmtDate = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString("ru-RU", { month: "short", year: "numeric" }) : ""

  const content: ResumeContent = {
    summary: "",
    experience: experiences.map((exp) => ({
      title: exp.title,
      company: exp.companyName,
      period: `${fmtDate(exp.startDate)} — ${exp.isCurrent ? "настоящее время" : fmtDate(exp.endDate)}`,
      bullets: exp.responsibilities,
    })),
    achievements: evidence.map((e) => e.result || e.title).filter(Boolean),
    skills: skills.map((s) => s.name),
    education: [],
    certifications: [],
    projects: [],
  }

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      careerTrackId: data.careerTrackId,
      name: data.name,
      language: data.language,
      isBase: true,
      structuredContent: content,
    },
  })

  revalidatePath("/resumes")
  return resume
}

export async function updateResumeContent(id: string, content: ResumeContent) {
  const user = await requireCurrentUser()
  assertOwned(await prisma.resume.findUnique({ where: { id } }), user.id)

  const data = resumeContentSchema.parse(content)
  await prisma.resume.update({ where: { id }, data: { structuredContent: data } })

  revalidatePath(`/resumes/${id}`)
  return { ok: true as const }
}

export async function renameResume(id: string, name: string) {
  const user = await requireCurrentUser()
  assertOwned(await prisma.resume.findUnique({ where: { id } }), user.id)

  await prisma.resume.update({ where: { id }, data: { name } })
  revalidatePath("/resumes")
  revalidatePath(`/resumes/${id}`)
  return { ok: true as const }
}

export async function deleteResume(id: string) {
  const user = await requireCurrentUser()
  assertOwned(await prisma.resume.findUnique({ where: { id } }), user.id)

  await prisma.resume.delete({ where: { id } })
  revalidatePath("/resumes")
  return { ok: true as const }
}
