import { z } from "zod"
import { employmentFormatSchema } from "./enums"

export const extractedExperienceSchema = z.object({
  companyName: z.string(),
  companyIndustry: z.string().nullable(),
  title: z.string(),
  employmentType: employmentFormatSchema.nullable(),
  startDate: z
    .string()
    .nullable()
    .describe("ISO date YYYY-MM-DD, or YYYY-MM if the day is unknown, or null if unclear"),
  endDate: z.string().nullable().describe("Same format as startDate, or null if current/unclear"),
  isCurrent: z.boolean(),
  location: z.string().nullable(),
  description: z.string().nullable(),
  responsibilities: z.array(z.string()),
  teamSize: z.number().int().nullable(),
  budgetDescription: z.string().nullable(),
})

export const experienceExtractionResultSchema = z.object({
  experiences: z.array(extractedExperienceSchema),
  notes: z
    .string()
    .nullable()
    .describe("Anything the model could not confidently parse, for the user to review"),
})

export type ExperienceExtractionResult = z.infer<typeof experienceExtractionResultSchema>

export const experienceFormSchema = z.object({
  companyName: z.string().min(1, "Укажите компанию"),
  companyIndustry: z.string().nullable(),
  title: z.string().min(1, "Укажите должность"),
  employmentType: employmentFormatSchema.nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  isCurrent: z.boolean(),
  location: z.string().nullable(),
  description: z.string().nullable(),
  responsibilities: z.array(z.string()),
  teamSize: z.number().int().nonnegative().nullable(),
  budgetDescription: z.string().nullable(),
})

export type ExperienceFormValues = z.infer<typeof experienceFormSchema>

/** Accepts "YYYY", "YYYY-MM", or "YYYY-MM-DD"; returns null for anything else. */
export function parseFlexibleDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const match = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(value.trim())
  if (!match) return null
  const [, year, month = "01", day = "01"] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDateForMonthInput(date: Date | null): string {
  if (!date) return ""
  return date.toISOString().slice(0, 7)
}
