"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requireCurrentUser } from "@/lib/auth/session"
import { resumeContentSchema, type ResumeContent } from "@/lib/validation/resume"
import {
  clarifyingAnswerSchema,
  quickTailorMatchSchema,
  type ClarifyingAnswer,
  type QuickTailorMatch,
  type QuickTailorResult,
} from "@/lib/validation/quick-tailor"
import { generateQuickTailor as runQuickTailorTask } from "@/lib/ai/tasks/generate-quick-tailor"
import { analyzeQuickTailorMatch } from "@/lib/ai/tasks/analyze-quick-tailor-match"
import { extractDocxText, extractPdfText, isDocxFile, isPdfFile } from "@/lib/files/extract-document-text"
import { fetchPageHtml, UnsafeUrlError } from "@/lib/security/safe-fetch"
import { extractOgMetadata, stripHtmlToText } from "@/lib/opportunities/extract-html"
import { buildQuickTailorGeneratePrompt, buildQuickTailorMatchPrompt } from "@/lib/quick-tailor/prompts"
import { MIN_JOB_CHARS, MIN_RESUME_CHARS, QUICK_TAILOR_MATCH_CREDIT_COST } from "@/lib/quick-tailor/costs"
import { track } from "@/lib/analytics/track"
import { assertOwned } from "@/lib/db/with-ownership"

const MAX_FILE_BYTES = 10 * 1024 * 1024

export type ExtractTextResult = { ok: true; text: string } | { ok: false; message: string }

export async function extractResumeTextFromFile(formData: FormData): Promise<ExtractTextResult> {
  await requireCurrentUser()
  const file = formData.get("file")
  if (!(file instanceof File)) return { ok: false, message: "Выберите файл .docx или .pdf." }
  if (file.size > MAX_FILE_BYTES) return { ok: false, message: "Файл слишком большой (максимум 10 МБ)." }

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    if (isDocxFile(file)) {
      const text = await extractDocxText(buffer)
      if (!text) return { ok: false, message: "Не удалось извлечь текст из файла. Вставьте текст вручную." }
      return { ok: true, text }
    }
    if (isPdfFile(file)) {
      const text = await extractPdfText(buffer)
      if (!text) {
        return {
          ok: false,
          message: "Не удалось извлечь текст из PDF (возможно, это скан). Вставьте текст вручную.",
        }
      }
      return { ok: true, text }
    }
  } catch {
    return { ok: false, message: "Не удалось прочитать файл. Вставьте текст вручную." }
  }

  return { ok: false, message: "Поддерживаются .docx и .pdf — или вставьте текст вручную." }
}

export async function extractVacancyTextFromUrl(
  url: string
): Promise<{ ok: true; text: string; title: string | null } | { ok: false; message: string }> {
  await requireCurrentUser()
  try {
    const page = await fetchPageHtml(url)
    const og = extractOgMetadata(page.html)
    const text = stripHtmlToText(page.html)
    if (text.length < MIN_JOB_CHARS) {
      return { ok: false, message: "Не удалось извлечь текст со страницы. Вставьте описание вручную." }
    }
    const combined = [og.title, og.description, text].filter(Boolean).join("\n\n")
    return { ok: true, text: combined, title: og.title }
  } catch (error) {
    const message =
      error instanceof UnsafeUrlError
        ? error.message
        : "Не удалось загрузить страницу. Вставьте текст вакансии вручную."
    return { ok: false, message }
  }
}

export type QuickTailorJobInput = { title: string; companyName: string; text: string }

export type AnalyzeMatchResult =
  | { ok: true; match: QuickTailorMatch; aiRunId: string; creditCost: number }
  | { ok: false; error: "not_configured" | "insufficient_credits" | "generation_failed" | "invalid_input"; message: string }

export async function analyzeMatch(resumeText: string, job: QuickTailorJobInput): Promise<AnalyzeMatchResult> {
  const user = await requireCurrentUser()
  const trimmedResume = resumeText.trim()
  const trimmedJob = job.text.trim()
  if (trimmedResume.length < MIN_RESUME_CHARS) {
    return { ok: false, error: "invalid_input", message: "Текст резюме слишком короткий — добавьте больше деталей." }
  }
  if (trimmedJob.length < MIN_JOB_CHARS) {
    return { ok: false, error: "invalid_input", message: "Добавьте текст вакансии (минимум несколько предложений)." }
  }

  const prompt = buildQuickTailorMatchPrompt(trimmedResume, {
    title: job.title.trim(),
    companyName: job.companyName.trim(),
    text: trimmedJob,
  })
  const result = await analyzeQuickTailorMatch(user.id, prompt)
  if (!result.ok) {
    return { ok: false, error: result.error, message: result.message }
  }

  track("quick_tailor_match_generated", user.id, { requirementCount: result.data.requirements.length })
  return { ok: true, match: result.data, aiRunId: result.aiRunId, creditCost: QUICK_TAILOR_MATCH_CREDIT_COST }
}

export type QuickTailorJobResult =
  | {
      ok: true
      opportunityId: string
      resumeId: string
      resumeVersionId: string
      title: string
      companyName: string
      keyChanges: QuickTailorResult["keyChanges"]
      coverLetter: string
      resume: ResumeContent
      aiRunId: string
    }
  | { ok: false; error: "not_configured" | "insufficient_credits" | "generation_failed" | "invalid_input"; message: string }

export async function runQuickTailor(input: {
  resumeText: string
  job: QuickTailorJobInput
  match: QuickTailorMatch
  answers: ClarifyingAnswer[]
}): Promise<QuickTailorJobResult> {
  const user = await requireCurrentUser()
  const trimmedResume = input.resumeText.trim()
  const jobText = input.job.text.trim()
  if (trimmedResume.length < MIN_RESUME_CHARS) {
    return { ok: false, error: "invalid_input", message: "Текст резюме слишком короткий — добавьте больше деталей." }
  }
  if (jobText.length < MIN_JOB_CHARS) {
    return { ok: false, error: "invalid_input", message: "Добавьте текст вакансии." }
  }

  const matchParsed = quickTailorMatchSchema.parse(input.match)
  const answers = input.answers
    .map((a) => clarifyingAnswerSchema.parse(a))
    .filter((a) => a.answer.trim().length > 0)

  const title = input.job.title.trim() || matchParsed.title?.trim() || "Вакансия"
  const companyName = input.job.companyName.trim() || matchParsed.companyName?.trim() || "Компания не указана"

  const opportunity = await prisma.opportunity.create({
    data: {
      userId: user.id,
      type: "vacancy",
      companyName,
      title,
      sourceName: "pasted_text",
      rawDescription: jobText,
      status: "saved",
      requirements: {
        create: matchParsed.requirements.map((r) => ({
          category: r.category,
          text: r.requirement,
          importance: r.importance,
        })),
      },
    },
  })

  const prompt = buildQuickTailorGeneratePrompt({
    resumeText: trimmedResume,
    job: { title, companyName, text: jobText },
    answers,
  })
  const result = await runQuickTailorTask(user.id, opportunity.id, prompt)
  if (!result.ok) {
    await prisma.opportunity.delete({ where: { id: opportunity.id } }).catch(() => undefined)
    return { ok: false, error: result.error, message: result.message }
  }

  const resumeName = `${title} — ${companyName}`
  const baseResume = await prisma.resume.create({
    data: {
      userId: user.id,
      name: resumeName,
      language: "ru",
      isBase: false,
      structuredContent: result.data.resume,
    },
  })

  const resumeVersion = await prisma.resumeVersion.create({
    data: {
      userId: user.id,
      resumeId: baseResume.id,
      opportunityId: opportunity.id,
      name: resumeName,
      language: "ru",
      structuredContent: result.data.resume,
      status: "draft",
      source: "quick_tailor",
    },
  })

  const changeNotes = result.data.keyChanges
    .map((c) => (c.requirement ? `• ${c.change} (${c.requirement})` : `• ${c.change}`))
    .join("\n")

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
      data: { notes: `AI-рекомендации по резюме для этой вакансии:\n${changeNotes}` },
    }),
  ])

  track("quick_tailor_generated", user.id, { opportunityId: opportunity.id, resumeVersionId: resumeVersion.id })
  track("try_generated", user.id, { opportunityId: opportunity.id })
  revalidatePath("/opportunities")
  revalidatePath("/resumes")
  revalidatePath("/pipeline")
  revalidatePath("/quick-tailor")

  return {
    ok: true,
    opportunityId: opportunity.id,
    resumeId: baseResume.id,
    resumeVersionId: resumeVersion.id,
    title,
    companyName,
    keyChanges: result.data.keyChanges,
    coverLetter: result.data.coverLetter,
    resume: result.data.resume,
    aiRunId: result.aiRunId,
  }
}

export async function saveQuickTailorEdits(input: {
  resumeVersionId: string
  resume: ResumeContent
  coverLetter: string
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const user = await requireCurrentUser()
  try {
    const version = await prisma.resumeVersion.findUnique({
      where: { id: input.resumeVersionId },
      include: { applications: { select: { id: true }, take: 1 } },
    })
    const owned = assertOwned(version, user.id)
    const content = resumeContentSchema.parse(input.resume)

    await prisma.resumeVersion.update({
      where: { id: owned.id },
      data: { structuredContent: content },
    })
    await prisma.resume.update({
      where: { id: owned.resumeId },
      data: { structuredContent: content },
    })
    if (owned.applications[0]) {
      await prisma.application.update({
        where: { id: owned.applications[0].id },
        data: { messageDraft: input.coverLetter },
      })
    }

    revalidatePath(`/resumes/${owned.resumeId}/versions/${owned.id}`)
    return { ok: true }
  } catch {
    return { ok: false, message: "Не удалось сохранить правки." }
  }
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
