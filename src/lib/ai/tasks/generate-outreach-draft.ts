import { runAiTask } from "@/lib/ai/run-ai-task"
import { outreachDraftResultSchema, type OutreachDraftResult } from "@/lib/validation/outreach"

const TASK_INSTRUCTIONS = `Task: draft a short outreach message / cover letter for the candidate to send about one
opportunity (to a recruiter, hiring manager, or as a cover note with an application).

Rules specific to this task:
- Use only the facts given (profile, evidence, opportunity). Never invent a shared
  connection, a reason for interest not stated by the candidate, or a result not in the
  given evidence.
- Ground the value proposition in one or two concrete, specific results from the given
  evidence — not generic claims like "proven track record."
- Address the "why this role / why now" honestly using the candidate's own stated
  motivation if given — never write something that implies the candidate will take any
  role, or that overstates enthusiasm not evidenced by the input.
- Keep it concise: 120-180 words for a message, a bit longer only if drafting a full
  cover letter was explicitly implied by the input.
- Write in the same language as the opportunity/profile text given to you.
- Do not add a fabricated sign-off with a name, phone number, or contact detail not
  given to you.
- "evidenceIds" must list only ids actually referenced in the draft, from the ids given.`

export async function generateOutreachDraft(
  userId: string,
  opportunityId: string,
  promptContent: string
): Promise<ReturnType<typeof runAiTask<OutreachDraftResult>>> {
  return runAiTask({
    userId,
    type: "outreach_draft",
    inputEntityIds: { opportunityId },
    taskInstructions: TASK_INSTRUCTIONS,
    userContent: promptContent,
    schema: outreachDraftResultSchema,
    maxTokens: 2048,
    creditCost: 2,
  })
}
