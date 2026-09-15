import { z } from "zod"
import { employmentFormatSchema } from "./enums"

export const careerTrackFormSchema = z.object({
  title: z.string().min(1, "Укажите название трека"),
  alternativeTitles: z.array(z.string()),
  employmentFormats: z.array(employmentFormatSchema),
  targetIndustries: z.array(z.string()),
  targetCompanyTypes: z.array(z.string()),
  targetCompanyStages: z.array(z.string()),
  targetCompanySizes: z.array(z.string()),
  businessProblems: z.array(z.string()),
  mustHaveSkills: z.array(z.string()),
  deemphasizedExperience: z.string().nullable(),
  valueProposition: z.string().nullable(),
  motivationStatement: z.string().nullable(),
  active: z.boolean(),
})

export type CareerTrackFormValues = z.infer<typeof careerTrackFormSchema>

export const careerTrackFormDefaults: CareerTrackFormValues = {
  title: "",
  alternativeTitles: [],
  employmentFormats: [],
  targetIndustries: [],
  targetCompanyTypes: [],
  targetCompanyStages: [],
  targetCompanySizes: [],
  businessProblems: [],
  mustHaveSkills: [],
  deemphasizedExperience: null,
  valueProposition: null,
  motivationStatement: null,
  active: true,
}

export const positioningDraftSchema = z.object({
  valueProposition: z
    .string()
    .describe("One or two sentences: 'I help [company type] solve [problem] through [skills], backed by [evidence].'"),
  motivationStatement: z.string().nullable().describe("Why this track, why now — grounded in the input given"),
  alternativeTitles: z.array(z.string()),
})

export type PositioningDraft = z.infer<typeof positioningDraftSchema>
