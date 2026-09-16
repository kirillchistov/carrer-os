import { z } from "zod"
import { fitDimensionSchema, fitDimensionStatusSchema, fitOverallLabelSchema } from "./enums"

export const fitDimensionResultSchema = z.object({
  dimension: fitDimensionSchema,
  status: fitDimensionStatusSchema,
  summary: z.string().describe("1-2 sentences, grounded in the given facts and evidence"),
  evidenceIds: z.array(z.string()).describe("Evidence IDs from the list given, only ones actually relevant"),
  requirementIds: z.array(z.string()).describe("Requirement IDs from the list given, only ones this dimension addresses"),
  recommendedAction: z
    .string()
    .nullable()
    .describe("What to do about this dimension: emphasize, clarify with the employer, or acknowledge as a real gap"),
})

export type FitDimensionResult = z.infer<typeof fitDimensionResultSchema>

export const fitAssessmentResultSchema = z.object({
  overallLabel: fitOverallLabelSchema,
  overallScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .nullable()
    .describe("A navigational indicator only, not a prediction of interview or offer odds"),
  dimensions: z.array(fitDimensionResultSchema),
  whyYouFit: z.string().describe("2-4 sentences on the strongest grounds for fit"),
  evidenceToEmphasize: z.array(z.string()).describe("Evidence IDs to lead with"),
  gapsAndRisks: z
    .array(z.string())
    .describe("Real gaps that should not be papered over — distinct from things that are just poorly worded"),
  questionsToValidate: z.array(z.string()).describe("Questions only the employer can answer"),
  resumeChangesRecommended: z.array(z.string()).describe("Concrete suggestions for what to change in the resume"),
  outreachAngle: z.string().describe("The one-sentence angle for an outreach message or cover letter"),
  nextBestAction: z.string(),
})

export type FitAssessmentResult = z.infer<typeof fitAssessmentResultSchema>

export const FIT_DIMENSION_ORDER = [
  "role_fit",
  "industry_fit",
  "business_problem_fit",
  "leadership_scale_fit",
  "skills_tools_fit",
  "employment_format_fit",
  "logistics_fit",
  "evidence_strength_fit",
  "motivation_risk_fit",
  "freshness_fit",
] as const

export const FIT_DIMENSION_LABELS: Record<string, string> = {
  role_fit: "Роль и обязанности",
  industry_fit: "Индустрия / домен",
  business_problem_fit: "Бизнес-задача",
  leadership_scale_fit: "Масштаб и лидерство",
  skills_tools_fit: "Навыки и инструменты",
  employment_format_fit: "Формат занятости",
  logistics_fit: "Локация / язык / логистика",
  evidence_strength_fit: "Сила доказательств",
  motivation_risk_fit: "Мотивация и риск overqualification",
  freshness_fit: "Актуальность опыта",
}

export const FIT_STATUS_LABELS: Record<string, string> = {
  strong: "Сильное совпадение",
  partial: "Частичное совпадение",
  gap: "Пробел",
  unknown: "Неизвестно",
}

export const FIT_OVERALL_LABELS: Record<string, string> = {
  strong_fit: "Сильный fit",
  partial_fit: "Частичный fit",
  weak_fit: "Слабый fit",
  unknown: "Недостаточно данных",
}
