import { z } from "zod"
import { interviewTypeSchema } from "./enums"

export const interviewFormSchema = z.object({
  date: z.string().min(1, "Укажите дату"),
  stage: interviewTypeSchema,
  interviewerName: z.string().nullable(),
  interviewerTitle: z.string().nullable(),
  questions: z.string().nullable(),
  notes: z.string().nullable(),
  feedback: z.string().nullable(),
  interestSignals: z.string().nullable(),
  objections: z.string().nullable(),
  agreements: z.string().nullable(),
  nextStep: z.string().nullable(),
  nextStepAt: z.string().nullable(),
})

export type InterviewFormValues = z.infer<typeof interviewFormSchema>

export const interviewFormDefaults: InterviewFormValues = {
  date: new Date().toISOString().slice(0, 10),
  stage: "recruiter_screen",
  interviewerName: null,
  interviewerTitle: null,
  questions: null,
  notes: null,
  feedback: null,
  interestSignals: null,
  objections: null,
  agreements: null,
  nextStep: null,
  nextStepAt: null,
}
