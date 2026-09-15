"use server"

import { revalidatePath } from "next/cache"
import { requireCurrentUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { assertOwned } from "@/lib/db/with-ownership"
import {
  experienceFormSchema,
  parseFlexibleDate,
  type ExperienceFormValues,
} from "@/lib/validation/experience"
import { extractExperienceFromText } from "@/lib/ai/tasks/extract-experience"
import { createSupabaseAdminClient, ensureDocumentsBucket, DOCUMENTS_BUCKET } from "@/lib/supabase/admin"
import { track } from "@/lib/analytics/track"

export async function listMyExperiences() {
  const user = await requireCurrentUser()
  return prisma.experience.findMany({
    where: { userId: user.id },
    orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }],
  })
}

function toExperienceCreateData(values: ExperienceFormValues) {
  return {
    companyName: values.companyName,
    companyIndustry: values.companyIndustry,
    title: values.title,
    employmentType: values.employmentType,
    startDate: parseFlexibleDate(values.startDate),
    endDate: values.isCurrent ? null : parseFlexibleDate(values.endDate),
    isCurrent: values.isCurrent,
    location: values.location,
    description: values.description,
    responsibilities: values.responsibilities,
    teamSize: values.teamSize,
    budgetDescription: values.budgetDescription,
  }
}

export async function createExperienceManual(values: ExperienceFormValues) {
  const user = await requireCurrentUser()
  const data = experienceFormSchema.parse(values)

  const experience = await prisma.experience.create({
    data: { userId: user.id, verificationStatus: "verified", ...toExperienceCreateData(data) },
  })

  revalidatePath("/profile/experience")
  return experience
}

export async function updateExperience(id: string, values: ExperienceFormValues) {
  const user = await requireCurrentUser()
  const existing = assertOwned(await prisma.experience.findUnique({ where: { id } }), user.id)

  const data = experienceFormSchema.parse(values)
  const wasUnverified = existing.verificationStatus === "unverified"

  await prisma.experience.update({
    where: { id },
    data: {
      ...toExperienceCreateData(data),
      verificationStatus: wasUnverified ? "edited" : existing.verificationStatus,
    },
  })

  revalidatePath("/profile/experience")
  return { ok: true as const }
}

export async function verifyExperience(id: string) {
  const user = await requireCurrentUser()
  const existing = await prisma.experience.findUnique({ where: { id } })
  assertOwned(existing, user.id)

  await prisma.experience.update({ where: { id }, data: { verificationStatus: "verified" } })
  revalidatePath("/profile/experience")
  return { ok: true as const }
}

export async function rejectExperience(id: string) {
  const user = await requireCurrentUser()
  const existing = await prisma.experience.findUnique({ where: { id } })
  assertOwned(existing, user.id)

  await prisma.experience.update({ where: { id }, data: { verificationStatus: "rejected" } })
  revalidatePath("/profile/experience")
  return { ok: true as const }
}

export async function deleteExperience(id: string) {
  const user = await requireCurrentUser()
  const existing = await prisma.experience.findUnique({ where: { id } })
  assertOwned(existing, user.id)

  await prisma.experience.delete({ where: { id } })
  revalidatePath("/profile/experience")
  return { ok: true as const }
}

type ImportResult =
  | { ok: true; created: number; aiRunId: string; notes: string | null }
  | { ok: false; reason: "not_configured" | "insufficient_credits" | "generation_failed" | "empty_input"; message: string }

export async function importExperienceFromText(rawText: string): Promise<ImportResult> {
  const user = await requireCurrentUser()
  const text = rawText.trim()
  if (text.length < 20) {
    return { ok: false, reason: "empty_input", message: "Вставьте текст резюме или описание опыта." }
  }

  const result = await extractExperienceFromText(user.id, text)
  if (!result.ok) {
    return { ok: false, reason: result.error, message: result.message }
  }

  await prisma.experience.createMany({
    data: result.data.experiences.map((exp) => ({
      userId: user.id,
      companyName: exp.companyName,
      companyIndustry: exp.companyIndustry,
      title: exp.title,
      employmentType: exp.employmentType,
      startDate: parseFlexibleDate(exp.startDate),
      endDate: exp.isCurrent ? null : parseFlexibleDate(exp.endDate),
      isCurrent: exp.isCurrent,
      location: exp.location,
      description: exp.description,
      responsibilities: exp.responsibilities,
      teamSize: exp.teamSize,
      budgetDescription: exp.budgetDescription,
      verificationStatus: "unverified",
    })),
  })

  track("experience_imported", user.id, { source: "paste_text", count: result.data.experiences.length })

  revalidatePath("/profile/experience")
  return {
    ok: true,
    created: result.data.experiences.length,
    aiRunId: result.aiRunId,
    notes: result.data.notes,
  }
}

const MAX_DOCX_BYTES = 10 * 1024 * 1024

export async function importExperienceFromDocx(formData: FormData): Promise<ImportResult> {
  const user = await requireCurrentUser()
  const file = formData.get("file")
  if (!(file instanceof File)) {
    return { ok: false, reason: "empty_input", message: "Выберите файл .docx." }
  }
  if (file.size > MAX_DOCX_BYTES) {
    return { ok: false, reason: "empty_input", message: "Файл слишком большой (максимум 10 МБ)." }
  }
  const isDocx =
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx")
  if (!isDocx) {
    return { ok: false, reason: "empty_input", message: "Поддерживается только формат .docx." }
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const mammoth = await import("mammoth")
  const extraction = await mammoth.extractRawText({ buffer })
  const extractedText = extraction.value.trim()

  await ensureDocumentsBucket()
  const admin = createSupabaseAdminClient()
  const storagePath = `${user.id}/${Date.now()}-${file.name}`
  const { error: uploadError } = await admin.storage.from(DOCUMENTS_BUCKET).upload(storagePath, buffer, {
    contentType: file.type,
  })

  const document = await prisma.document.create({
    data: {
      userId: user.id,
      storagePath,
      originalFilename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      documentType: "resume_import",
      extractionStatus: uploadError ? "failed" : extractedText ? "success" : "partial",
      extractedText: extractedText || null,
    },
  })

  if (!extractedText) {
    return {
      ok: false,
      reason: "empty_input",
      message: "Не удалось извлечь текст из файла. Попробуйте вставить текст вручную.",
    }
  }

  const result = await extractExperienceFromText(user.id, extractedText)
  if (!result.ok) {
    return { ok: false, reason: result.error, message: result.message }
  }

  await prisma.experience.createMany({
    data: result.data.experiences.map((exp) => ({
      userId: user.id,
      sourceDocumentId: document.id,
      companyName: exp.companyName,
      companyIndustry: exp.companyIndustry,
      title: exp.title,
      employmentType: exp.employmentType,
      startDate: parseFlexibleDate(exp.startDate),
      endDate: exp.isCurrent ? null : parseFlexibleDate(exp.endDate),
      isCurrent: exp.isCurrent,
      location: exp.location,
      description: exp.description,
      responsibilities: exp.responsibilities,
      teamSize: exp.teamSize,
      budgetDescription: exp.budgetDescription,
      verificationStatus: "unverified",
    })),
  })

  track("experience_imported", user.id, { source: "docx", count: result.data.experiences.length })

  revalidatePath("/profile/experience")
  return {
    ok: true,
    created: result.data.experiences.length,
    aiRunId: result.aiRunId,
    notes: result.data.notes,
  }
}
