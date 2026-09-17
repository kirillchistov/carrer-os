import { runAiTask } from "@/lib/ai/run-ai-task"
import { quickTailorMatchSchema, type QuickTailorMatch } from "@/lib/validation/quick-tailor"
import { QUICK_TAILOR_MATCH_CREDIT_COST } from "@/lib/quick-tailor/costs"

const TASK_INSTRUCTIONS = `Task: compare one candidate resume (raw text) with one job description.
Produce a requirement-by-requirement coverage matrix, keyword overlap, and up to 4 clarifying
questions. Do not write a tailored resume yet.

Rules:
- Every requirement must come from the vacancy text. Do not invent requirements.
- coverage:
  - "full" — the resume states this with a checkable fact (quote it in resumeQuote)
  - "partial" — related fact exists but lacks scale, ownership, tool, or metric
  - "missing" — the resume has no supporting fact (resumeQuote must be null)
- resumeQuote must be a short verbatim (or near-verbatim) excerpt from the resume, or null.
  Never fabricate a quote.
- keywordHits / keywordMisses are short terms from the vacancy (skills, tools, domain words).
  Do not invent ATS scores or percentages.
- questions: only for partial/missing must-haves where a short real-life answer would help.
  Skip questions you could not verify later. Empty array is fine.
- summary: 2–3 honest sentences. No promises about interviews or ATS pass rates.
- Write in the same language as the resume.`

export async function analyzeQuickTailorMatch(
  userId: string,
  promptContent: string
): Promise<ReturnType<typeof runAiTask<QuickTailorMatch>>> {
  return runAiTask({
    userId,
    type: "fit_assessment",
    inputEntityIds: {},
    taskInstructions: TASK_INSTRUCTIONS,
    userContent: promptContent,
    schema: quickTailorMatchSchema,
    maxTokens: 4096,
    creditCost: QUICK_TAILOR_MATCH_CREDIT_COST,
  })
}
