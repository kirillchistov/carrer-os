import { z } from "zod"
import { resumeContentSchema } from "./resume"

export const quickTailorResultSchema = z.object({
  resume: resumeContentSchema,
  keyChanges: z
    .array(z.string())
    .describe("Short bullet points explaining what was changed vs. the original resume and why, for the candidate to review"),
  coverLetter: z.string(),
})
export type QuickTailorResult = z.infer<typeof quickTailorResultSchema>
