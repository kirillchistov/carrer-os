"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requireCurrentUser } from "@/lib/auth/session"
import { emptyResumeContent } from "@/lib/validation/resume"
import { generateQuickTailor as runQuickTailorTask } from "@/lib/ai/tasks/generate-quick-tailor"
import { track } from "@/lib/analytics/track"

const MAX_DOCX_BYTES = 10 * 1024 * 1024

export async function extractResumeTextFromDocx(
  formData: FormData
): Promise<{ ok: true; text: string } | { ok: false; message: string }> {
  await requireCurrentUser()
  const file = formData.get("file")
  if (!(file instanceof File)) return { ok: false, message: "Выберите файл .docx." }
  if (file.size > MAX_DOCX_BYTES) return { ok: false, message: "Файл слишком большой (максимум 10 МБ)." }

  const isDocx =
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx")
  if (!isDocx) return { ok: false, message: "Поддерживается только формат .docx — или вставьте текст вручную." }

  const buffer = Buffer.from(await file.arrayBuffer())
  const mammoth = await import("mammoth")
  const extraction = await mammoth.extractRawText({ buffer })
  const text = extraction.value.trim()

  if (!text) return { ok: false, message: "Не удалось извлечь текст из файла. Попробуйте вставить текст вручную." }
  return { ok: true, text }
}

export type QuickTailorJobInput = { title: string; companyName: string; text: string }
export type QuickTailorJobResult =
  | {
      ok: true
      opportunityId: string
      resumeVersionId: string
      title: string
      companyName: string
      keyChanges: string[]
      coverLetter: string
    }
  | { ok: false; title: string; companyName: string; message: string }

export async function runQuickTailor(
  resumeText: string,
  jobs: QuickTailorJobInput[]
): Promise<{ resumeId: string; results: QuickTailorJobResult[] }> {
  const user = await requireCurrentUser()

  const trimmedResumeText = resumeText.trim()
  if (trimmedResumeText.length < 50) {
    throw new Error("Текст резюме слишком короткий — добавьте больше деталей.")
  }
  const validJobs = jobs.filter((j) => j.text.trim().length >= 30).slice(0, 3)
  if (validJobs.length === 0) {
    throw new Error("Добавьте текст хотя бы одной вакансии (минимум несколько предложений).")
  }

  const baseResume = await prisma.resume.create({
    data: {
      userId: user.id,
      name: "Загруженное резюме (черновик)",
      language: "ru",
      isBase: true,
      structuredContent: { ...emptyResumeContent, summary: trimmedResumeText },
    },
  })

  const results: QuickTailorJobResult[] = []

  for (let i = 0; i < validJobs.length; i++) {
    const job = validJobs[i]
    const title = job.title.trim() || `Вакансия ${i + 1}`
    const companyName = job.companyName.trim() || "Компания не указана"

    const opportunity = await prisma.opportunity.create({
      data: {
        userId: user.id,
        type: "vacancy",
        companyName,
        title,
        sourceName: "pasted_text",
        rawDescription: job.text.trim(),
        status: "saved",
      },
    })

    const promptContent = [
      `## Candidate's current resume (raw text, source of truth for all facts)`,
      trimmedResumeText,
      ``,
      `## Target job description`,
      `${title} — ${companyName}`,
      job.text.trim(),
    ].join("\n")

    const result = await runQuickTailorTask(user.id, opportunity.id, promptContent)
    if (!result.ok) {
      results.push({ ok: false, title, companyName, message: result.message })
      continue
    }

    const resumeVersion = await prisma.resumeVersion.create({
      data: {
        userId: user.id,
        resumeId: baseResume.id,
        opportunityId: opportunity.id,
        name: `${baseResume.name} — ${companyName}`,
        language: "ru",
        structuredContent: result.data.resume,
        status: "draft",
        source: "quick_tailor",
      },
    })

    await Promise.all([
      prisma.application.create({
        data: {
          userId: user.id,
          opportunityId: opportunity.id,
          resumeVersionId: resumeVersion.id,
          channel: "direct_apply",
          messageDraft: result.data.coverLetter,
        },
      }),
      prisma.opportunity.update({
        where: { id: opportunity.id },
        data: {
          notes: `AI-рекомендации по резюме для этой вакансии:\n${result.data.keyChanges.map((c) => `• ${c}`).join("\n")}`,
        },
      }),
    ])

    track("quick_tailor_generated", user.id, { opportunityId: opportunity.id, resumeVersionId: resumeVersion.id })

    results.push({
      ok: true,
      opportunityId: opportunity.id,
      resumeVersionId: resumeVersion.id,
      title,
      companyName,
      keyChanges: result.data.keyChanges,
      coverLetter: result.data.coverLetter,
    })
  }

  revalidatePath("/opportunities")
  revalidatePath("/resumes")
  revalidatePath("/pipeline")
  return { resumeId: baseResume.id, results }
}

export type QuickTailorHistoryItem = {
  id: string
  resumeId: string
  opportunityId: string | null
  title: string
  companyName: string
  createdAt: Date
}

export async function listQuickTailorResults(): Promise<QuickTailorHistoryItem[]> {
  const user = await requireCurrentUser()
  const versions = await prisma.resumeVersion.findMany({
    where: { userId: user.id, source: "quick_tailor" },
    include: { opportunity: { select: { title: true, companyName: true } } },
    orderBy: { createdAt: "desc" },
  })

  return versions.map((v) => ({
    id: v.id,
    resumeId: v.resumeId,
    opportunityId: v.opportunityId,
    title: v.opportunity?.title ?? v.name,
    companyName: v.opportunity?.companyName ?? "",
    createdAt: v.createdAt,
  }))
}
