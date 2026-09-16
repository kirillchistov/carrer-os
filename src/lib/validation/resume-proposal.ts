import { z } from "zod"
import { resumeChangeTypeSchema } from "./enums"

export const proposedChangeSchema = z.object({
  section: z
    .string()
    .describe('One of: "summary", "achievements", "skills", "certifications", "projects", or "experience.<index>"'),
  changeType: resumeChangeTypeSchema,
  originalText: z
    .string()
    .nullable()
    .describe("The exact existing text being changed — required for rewrite/remove, null for add"),
  proposedText: z.string(),
  rationale: z.string().describe("Why this change, in one sentence"),
  evidenceIds: z.array(z.string()).describe("Evidence/experience ids from the list given that support this change"),
})

export const resumeProposalsResultSchema = z.object({
  proposals: z.array(proposedChangeSchema),
})

export type ProposedChange = z.infer<typeof proposedChangeSchema>
export type ResumeProposalsResult = z.infer<typeof resumeProposalsResultSchema>
