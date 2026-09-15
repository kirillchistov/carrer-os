import { z } from "zod"

export const evidenceFormSchema = z.object({
  title: z.string().min(1, "Укажите название"),
  careerTrackId: z.string().nullable(),
  experienceId: z.string().nullable(),
  situation: z.string().nullable(),
  task: z.string().nullable(),
  action: z.string().nullable(),
  result: z.string().nullable(),
  metricValue: z.number().nullable(),
  metricUnit: z.string().nullable(),
  metricDescription: z.string().nullable(),
  timeframe: z.string().nullable(),
  scaleDescription: z.string().nullable(),
  teamSize: z.number().int().nonnegative().nullable(),
  budgetDescription: z.string().nullable(),
  pAndLDescription: z.string().nullable(),
  industries: z.array(z.string()),
  skills: z.array(z.string()),
  isReusableInResume: z.boolean(),
  isReusableInInterview: z.boolean(),
  isReusableInOutreach: z.boolean(),
})

export type EvidenceFormValues = z.infer<typeof evidenceFormSchema>

export const evidenceFormDefaults: EvidenceFormValues = {
  title: "",
  careerTrackId: null,
  experienceId: null,
  situation: null,
  task: null,
  action: null,
  result: null,
  metricValue: null,
  metricUnit: null,
  metricDescription: null,
  timeframe: null,
  scaleDescription: null,
  teamSize: null,
  budgetDescription: null,
  pAndLDescription: null,
  industries: [],
  skills: [],
  isReusableInResume: true,
  isReusableInInterview: true,
  isReusableInOutreach: true,
}

export const evidenceGapSuggestionSchema = z.object({
  missingSignals: z
    .array(z.string())
    .describe("Short phrases naming what's structurally missing, e.g. 'no personal contribution stated'"),
  suggestions: z
    .array(z.string())
    .describe("Concrete, specific questions or prompts to help the user fill the gaps"),
})

export type EvidenceGapSuggestion = z.infer<typeof evidenceGapSuggestionSchema>
