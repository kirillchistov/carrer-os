import { z } from "zod"
import { localeSchema } from "./enums"

export const resumeExperienceEntrySchema = z.object({
  title: z.string(),
  company: z.string(),
  period: z.string(),
  bullets: z.array(z.string()),
})

export const resumeEducationEntrySchema = z.object({
  degree: z.string(),
  institution: z.string(),
  year: z.string(),
})

export const resumeContentSchema = z.object({
  summary: z.string(),
  experience: z.array(resumeExperienceEntrySchema),
  achievements: z.array(z.string()),
  skills: z.array(z.string()),
  education: z.array(resumeEducationEntrySchema),
  certifications: z.array(z.string()),
  projects: z.array(z.string()),
})

export type ResumeContent = z.infer<typeof resumeContentSchema>

export const emptyResumeContent: ResumeContent = {
  summary: "",
  experience: [],
  achievements: [],
  skills: [],
  education: [],
  certifications: [],
  projects: [],
}

export const createResumeSchema = z.object({
  name: z.string().min(1, "Укажите название"),
  language: localeSchema,
  careerTrackId: z.string().nullable(),
})

export type CreateResumeValues = z.infer<typeof createResumeSchema>
