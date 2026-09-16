import { z } from "zod"

export const outreachDraftResultSchema = z.object({
  draft: z.string().describe("The full outreach message or cover-letter draft, ready to send after review"),
  evidenceIds: z.array(z.string()).describe("Evidence/experience ids from the list given that the draft actually uses"),
})

export type OutreachDraftResult = z.infer<typeof outreachDraftResultSchema>
