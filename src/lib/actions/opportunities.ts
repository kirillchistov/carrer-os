"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requireCurrentUser } from "@/lib/auth/session"
import { assertOwned, ownedWhere } from "@/lib/db/with-ownership"
import {
  opportunityFormSchema,
  requirementFormSchema,
  type OpportunityFormValues,
  type RequirementFormValues,
} from "@/lib/validation/opportunity"
import { parseOpportunityText } from "@/lib/ai/tasks/parse-opportunity"
import { fetchPageHtml, UnsafeUrlError } from "@/lib/security/safe-fetch"
import { extractOgMetadata, stripHtmlToText } from "@/lib/opportunities/extract-html"
import { track } from "@/lib/analytics/track"
import type { OpportunityStatus } from "@prisma/client"

export async function listMyOpportunities() {
  const user = await requireCurrentUser()
  return prisma.opportunity.findMany({
    where: ownedWhere(user.id),
    orderBy: { updatedAt: "desc" },
  })
}

export async function getOpportunity(id: string) {
  const user = await requireCurrentUser()
  const opportunity = assertOwned(await prisma.opportunity.findUnique({ where: { id } }), user.id)
  const requirements = await prisma.opportunityRequirement.findMany({
    where: { opportunityId: id },
    orderBy: { createdAt: "asc" },
  })
  return { opportunity, requirements }
}

function toOpportunityData(values: OpportunityFormValues) {
  return {
    type: values.type,
    companyName: values.companyName,
    title: values.title,
    sourceUrl: values.sourceUrl,
    location: values.location,
    workMode: values.workMode,
    employmentFormat: values.employmentFormat,
    compensationMin: values.compensationMin,
    compensationMax: values.compensationMax,
    compensationCurrency: values.compensationCurrency,
    rawDescription: values.rawDescription,
    status: values.status,
    priority: values.priority,
    nextAction: values.nextAction,
    nextActionDueAt: values.nextActionDueAt ? new Date(values.nextActionDueAt) : null,
    followUpAt: values.followUpAt ? new Date(values.followUpAt) : null,
    deadlineAt: values.deadlineAt ? new Date(values.deadlineAt) : null,
    notes: values.notes,
  }
}

export async function createOpportunityManual(values: OpportunityFormValues) {
  const user = await requireCurrentUser()
  const data = opportunityFormSchema.parse(values)

  const opportunity = await prisma.opportunity.create({
    data: { userId: user.id, sourceName: "manual", ...toOpportunityData(data) },
  })

  track("opportunity_created", user.id, { opportunityId: opportunity.id, source: "manual" })
  revalidatePath("/opportunities")
  revalidatePath("/pipeline")
  return opportunity
}

export async function updateOpportunity(id: string, values: OpportunityFormValues) {
  const user = await requireCurrentUser()
  assertOwned(await prisma.opportunity.findUnique({ where: { id } }), user.id)

  const data = opportunityFormSchema.parse(values)
  await prisma.opportunity.update({ where: { id }, data: toOpportunityData(data) })

  revalidatePath("/opportunities")
  revalidatePath(`/opportunities/${id}`)
  revalidatePath("/pipeline")
  return { ok: true as const }
}

export async function updateOpportunityStatus(id: string, status: OpportunityStatus) {
  const user = await requireCurrentUser()
  const existing = assertOwned(await prisma.opportunity.findUnique({ where: { id } }), user.id)

  await prisma.opportunity.update({ where: { id }, data: { status } })
  track("application_stage_changed", user.id, { opportunityId: id, from: existing.status, to: status })

  revalidatePath("/pipeline")
  revalidatePath(`/opportunities/${id}`)
  return { ok: true as const }
}

export async function deleteOpportunity(id: string) {
  const user = await requireCurrentUser()
  assertOwned(await prisma.opportunity.findUnique({ where: { id } }), user.id)

  await prisma.opportunity.delete({ where: { id } })
  revalidatePath("/opportunities")
  revalidatePath("/pipeline")
  return { ok: true as const }
}

export async function updateRequirements(opportunityId: string, requirements: RequirementFormValues[]) {
  const user = await requireCurrentUser()
  assertOwned(await prisma.opportunity.findUnique({ where: { id: opportunityId } }), user.id)

  const parsed = requirements.map((r) => requirementFormSchema.parse(r))

  await prisma.$transaction([
    prisma.opportunityRequirement.deleteMany({ where: { opportunityId } }),
    prisma.opportunityRequirement.createMany({
      data: parsed.map((r) => ({
        opportunityId,
        category: r.category,
        text: r.text,
        importance: r.importance,
        normalizedSkill: r.normalizedSkill,
      })),
    }),
  ])

  revalidatePath(`/opportunities/${opportunityId}`)
  return { ok: true as const }
}

type ParseOutcome =
  | { ok: true; opportunityId: string; aiRunId: string }
  | { ok: false; message: string }

export async function createOpportunityFromText(rawText: string): Promise<ParseOutcome> {
  const user = await requireCurrentUser()
  const text = rawText.trim()
  if (text.length < 20) {
    return { ok: false, message: "Вставьте текст описания вакансии или проекта." }
  }

  const result = await parseOpportunityText(user.id, text)
  if (!result.ok) {
    return { ok: false, message: result.message }
  }

  const opportunity = await createFromParseResult(user.id, {
    sourceName: "pasted_text",
    sourceUrl: null,
    rawDescription: text,
    parsed: result.data,
  })

  track("opportunity_created", user.id, { opportunityId: opportunity.id, source: "pasted_text" })
  revalidatePath("/opportunities")
  revalidatePath("/pipeline")
  return { ok: true, opportunityId: opportunity.id, aiRunId: result.aiRunId }
}

export async function createOpportunityFromUrl(url: string): Promise<ParseOutcome> {
  const user = await requireCurrentUser()

  let html: string
  try {
    const page = await fetchPageHtml(url)
    html = page.html
  } catch (error) {
    const message =
      error instanceof UnsafeUrlError
        ? error.message
        : "Не удалось загрузить страницу. Вставьте текст вакансии вручную."
    return { ok: false, message }
  }

  const og = extractOgMetadata(html)
  const text = stripHtmlToText(html)
  if (text.length < 20) {
    return { ok: false, message: "Не удалось извлечь текст со страницы. Вставьте текст вручную." }
  }

  const combinedText = [og.title, og.description, text].filter(Boolean).join("\n\n")
  const result = await parseOpportunityText(user.id, combinedText)
  if (!result.ok) {
    return { ok: false, message: result.message }
  }

  const opportunity = await createFromParseResult(user.id, {
    sourceName: "url",
    sourceUrl: url,
    rawDescription: text,
    parsed: result.data,
  })

  track("opportunity_created", user.id, { opportunityId: opportunity.id, source: "url" })
  revalidatePath("/opportunities")
  revalidatePath("/pipeline")
  return { ok: true, opportunityId: opportunity.id, aiRunId: result.aiRunId }
}

async function createFromParseResult(
  userId: string,
  input: {
    sourceName: "pasted_text" | "url"
    sourceUrl: string | null
    rawDescription: string
    parsed: import("@/lib/validation/opportunity").OpportunityParseResult
  }
) {
  const { parsed } = input
  return prisma.opportunity.create({
    data: {
      userId,
      type: parsed.type ?? "vacancy",
      companyName: parsed.companyName ?? "Не указано",
      title: parsed.title ?? "Без названия",
      sourceName: input.sourceName,
      sourceUrl: input.sourceUrl,
      location: parsed.location,
      workMode: parsed.workMode,
      employmentFormat: parsed.employmentFormat,
      compensationMin: parsed.compensationMin,
      compensationMax: parsed.compensationMax,
      compensationCurrency: parsed.compensationCurrency,
      rawDescription: input.rawDescription,
      status: "saved",
      priority: "medium",
      notes: parsed.summary,
      requirements: {
        create: parsed.requirements.map((r) => ({
          category: r.category,
          text: r.text,
          importance: r.importance,
          normalizedSkill: r.normalizedSkill,
        })),
      },
    },
  })
}
