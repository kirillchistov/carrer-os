import { z } from "zod"
import {
  employmentFormatSchema,
  opportunityStatusSchema,
  opportunityTypeSchema,
  requirementCategorySchema,
  requirementImportanceSchema,
  taskPrioritySchema,
  workModeSchema,
} from "./enums"

export const opportunityFormSchema = z.object({
  type: opportunityTypeSchema,
  companyName: z.string().min(1, "Укажите компанию"),
  title: z.string().min(1, "Укажите название роли"),
  sourceUrl: z.string().url().nullable(),
  location: z.string().nullable(),
  workMode: workModeSchema.nullable(),
  employmentFormat: employmentFormatSchema.nullable(),
  compensationMin: z.number().int().nonnegative().nullable(),
  compensationMax: z.number().int().nonnegative().nullable(),
  compensationCurrency: z.string().max(10).nullable(),
  rawDescription: z.string().nullable(),
  status: opportunityStatusSchema,
  priority: taskPrioritySchema,
  nextAction: z.string().nullable(),
  nextActionDueAt: z.string().nullable(),
  followUpAt: z.string().nullable(),
  deadlineAt: z.string().nullable(),
  notes: z.string().nullable(),
})

export type OpportunityFormValues = z.infer<typeof opportunityFormSchema>

export const opportunityFormDefaults: OpportunityFormValues = {
  type: "vacancy",
  companyName: "",
  title: "",
  sourceUrl: null,
  location: null,
  workMode: null,
  employmentFormat: null,
  compensationMin: null,
  compensationMax: null,
  compensationCurrency: null,
  rawDescription: null,
  status: "saved",
  priority: "medium",
  nextAction: null,
  nextActionDueAt: null,
  followUpAt: null,
  deadlineAt: null,
  notes: null,
}

export const requirementFormSchema = z.object({
  id: z.string().nullable(),
  category: requirementCategorySchema,
  text: z.string().min(1),
  importance: requirementImportanceSchema,
  normalizedSkill: z.string().nullable(),
})

export type RequirementFormValues = z.infer<typeof requirementFormSchema>

export const extractedRequirementSchema = z.object({
  category: requirementCategorySchema,
  text: z.string(),
  importance: requirementImportanceSchema,
  normalizedSkill: z
    .string()
    .nullable()
    .describe("A short, normalized skill/tool name if this requirement names one, else null"),
})

export const opportunityParseResultSchema = z.object({
  companyName: z.string().nullable(),
  title: z.string().nullable(),
  type: opportunityTypeSchema.nullable(),
  location: z.string().nullable(),
  workMode: workModeSchema.nullable(),
  employmentFormat: employmentFormatSchema.nullable(),
  compensationMin: z.number().int().nullable(),
  compensationMax: z.number().int().nullable(),
  compensationCurrency: z.string().nullable(),
  summary: z.string().nullable().describe("A short 2-3 sentence summary of the opportunity"),
  requirements: z.array(extractedRequirementSchema),
})

export type OpportunityParseResult = z.infer<typeof opportunityParseResultSchema>
