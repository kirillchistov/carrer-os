import { runAiTask } from "@/lib/ai/run-ai-task"
import { quickTailorResultSchema, type QuickTailorResult } from "@/lib/validation/quick-tailor"

const TASK_INSTRUCTIONS = `Task: given a candidate's existing resume as raw text and one target job description as raw
text, produce a tailored version of the resume for that job, a short list of what changed and
why, and a cover letter/outreach message.

Rules specific to this task:
- The raw resume text is the ONLY source of truth about the candidate's facts. Never invent a
  company, title, date, metric, or result that is not stated or clearly implied in it. You may
  rephrase, reorder, regroup, and re-emphasize existing facts for relevance to the job — never
  add new ones.
- "resume" must be the full tailored resume in the given structured shape (summary, experience,
  achievements, skills, education, certifications, projects) — not just a diff. Carry over every
  role, date range, and fact from the original that is still relevant; it is fine to omit
  clearly irrelevant older detail from "achievements"/"skills" if it doesn't serve this job, but
  never invent a replacement fact to fill the gap.
- "keyChanges" is a short list (3-6 items) in plain language explaining what you changed
  compared to the original resume and which part of the job description each change responds
  to — this is what the candidate reads to decide whether to trust the result.
- "coverLetter": 120-180 words, grounded only in facts from the resume text, addresses why this
  role honestly using only motivation cues actually present in the input (never invent
  enthusiasm or a connection to the company). No fabricated sign-off details (phone, name
  beyond what's in the resume).
- Write everything in the same language as the resume text given to you.`

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
    creditCost: 3,
  })
}
