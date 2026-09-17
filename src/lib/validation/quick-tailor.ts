import { z } from "zod"
import { resumeContentSchema } from "./resume"
import { requirementCategorySchema, requirementImportanceSchema } from "./enums"
import { MAX_CLARIFYING_QUESTIONS } from "@/lib/quick-tailor/costs"

export const matchCoverageSchema = z.enum(["full", "partial", "missing"])
export type MatchCoverage = z.infer<typeof matchCoverageSchema>

export const quickTailorMatchRequirementSchema = z.object({
  requirement: z.string(),
  category: requirementCategorySchema,
  importance: requirementImportanceSchema,
  coverage: matchCoverageSchema,
  resumeQuote: z
    .string()
    .nullable()
    .describe("A short verbatim quote from the resume that supports this requirement, or null if none"),
  comment: z.string().describe("Plain-language explanation of the coverage for the candidate"),
})
export type QuickTailorMatchRequirement = z.infer<typeof quickTailorMatchRequirementSchema>

export const clarifyingQuestionSchema = z.object({
  id: z.string().describe("Stable id like q1, q2"),
  prompt: z.string(),
  why: z.string().describe("Which gap or partial match this question would close"),
})
export type ClarifyingQuestion = z.infer<typeof clarifyingQuestionSchema>

export const quickTailorMatchSchema = z.object({
  title: z.string().nullable(),
  companyName: z.string().nullable(),
  summary: z.string().describe("2-3 sentences on overall fit, no invented ATS percentages"),
  requirements: z.array(quickTailorMatchRequirementSchema).min(1),
  keywordHits: z.array(z.string()).describe("Terms from the vacancy already present in the resume"),
  keywordMisses: z
    .array(z.string())
    .describe("Important vacancy terms not found in the resume; do not invent replacements"),
  questions: z
    .array(clarifyingQuestionSchema)
    .max(MAX_CLARIFYING_QUESTIONS)
    .describe("Ask only about partial/missing must-haves. Empty if nothing useful to ask."),
})
export type QuickTailorMatch = z.infer<typeof quickTailorMatchSchema>

export const quickTailorKeyChangeSchema = z.object({
  change: z.string(),
  requirement: z.string().nullable().describe("The vacancy requirement this change responds to, if any"),
})

export const quickTailorResultSchema = z.object({
  resume: resumeContentSchema,
  keyChanges: z.array(quickTailorKeyChangeSchema).min(1).max(8),
  coverLetter: z.string(),
})
export type QuickTailorResult = z.infer<typeof quickTailorResultSchema>

export const clarifyingAnswerSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  answer: z.string(),
})
export type ClarifyingAnswer = z.infer<typeof clarifyingAnswerSchema>
