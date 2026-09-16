import { z } from "zod"
import { careerTrackSuggestionFieldSchema } from "./enums"

export const interviewEvidenceDraftSchema = z.object({
  title: z.string(),
  situation: z.string().nullable(),
  task: z.string().nullable(),
  action: z.string().nullable(),
  result: z.string().nullable(),
  metricValue: z.number().nullable(),
  metricUnit: z.string().nullable(),
  skills: z.array(z.string()),
  industries: z.array(z.string()),
})
export type InterviewEvidenceDraft = z.infer<typeof interviewEvidenceDraftSchema>

export const interviewTrackSuggestionSchema = z.object({
  field: careerTrackSuggestionFieldSchema,
  value: z.string(),
  rationale: z.string(),
})
export type InterviewTrackSuggestion = z.infer<typeof interviewTrackSuggestionSchema>

export const interviewLearningsResultSchema = z.object({
  summary: z.string().describe("2-4 sentence plain-language summary of what this interview revealed"),
  evidenceDrafts: z.array(interviewEvidenceDraftSchema).max(5),
  careerTrackSuggestions: z.array(interviewTrackSuggestionSchema).max(5),
})
export type InterviewLearningsResult = z.infer<typeof interviewLearningsResultSchema>

export const CAREER_TRACK_SUGGESTION_FIELD_LABELS: Record<string, string> = {
  businessProblems: "Бизнес-задача",
  mustHaveSkills: "Обязательный навык",
  targetIndustries: "Целевая индустрия",
}
