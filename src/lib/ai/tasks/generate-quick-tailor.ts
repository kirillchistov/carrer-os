import { runAiTask } from "@/lib/ai/run-ai-task"
import { quickTailorResultSchema, type QuickTailorResult } from "@/lib/validation/quick-tailor"
import { QUICK_TAILOR_GENERATE_CREDIT_COST } from "@/lib/quick-tailor/costs"

const TASK_INSTRUCTIONS = `Task: given a candidate's resume as raw text, one target job description,
and optional clarifying answers from the candidate, produce a tailored resume, a list of what
changed and why, and a cover letter.

Rules:
- The resume text PLUS the candidate's clarifying answers are the ONLY allowed sources of facts.
  Never invent a company, title, date, metric, or result that is not in those two sources.
  Clarifying answers may add facts the resume omitted; mark them as coming from the candidate.
- "resume" is the full tailored resume in the given structured shape (summary, experience,
  achievements, skills, education, certifications, projects) — not a dump of the raw text into
  summary. Parse roles, dates, and bullets. Rephrase, reorder, and re-emphasize for this job.
  Omit clearly irrelevant older detail; never invent a replacement.
- "keyChanges": 3–6 items. Each has "change" (what you did) and "requirement" (which vacancy
  requirement it responds to, or null).
- "coverLetter": 120–180 words, grounded only in allowed facts. No fabricated enthusiasm,
  company connection, phone, or name beyond what's in the resume.
- Write everything in the same language as the resume.`

export async function generateQuickTailor(
  userId: string,
  opportunityId: string,
  promptContent: string
): Promise<ReturnType<typeof runAiTask<QuickTailorResult>>> {
  return runAiTask({
    userId,
    type: "resume_proposal",
    inputEntityIds: { opportunityId },
    taskInstructions: TASK_INSTRUCTIONS,
    userContent: promptContent,
    schema: quickTailorResultSchema,
    maxTokens: 6144,
    creditCost: QUICK_TAILOR_GENERATE_CREDIT_COST,
  })
}
