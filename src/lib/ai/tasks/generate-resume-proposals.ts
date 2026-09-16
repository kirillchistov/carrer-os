import { runAiTask } from "@/lib/ai/run-ai-task"
import { resumeProposalsResultSchema, type ResumeProposalsResult } from "@/lib/validation/resume-proposal"

const TASK_INSTRUCTIONS = `Task: propose specific, reviewable changes to tailor one resume for one opportunity.

You will be given the resume's current sections (with experience entries indexed), a
list of the candidate's evidence/experience with ids, the opportunity's requirements,
and — if available — an existing fit assessment's gaps and recommended resume changes.

Rules specific to this task:
- Every proposal must be grounded in an id from the evidence/experience list given. Set
  "evidenceIds" to those ids. Never propose a claim, metric, or result that isn't
  already stated in the given evidence — you may rephrase or reorder existing facts for
  clarity and relevance, but never add a new fact.
- "section" must be exactly one of: "summary", "achievements", "skills",
  "certifications", "projects", or "experience.<index>" using the indices given.
- For changeType "rewrite" or "remove", "originalText" must be the exact existing text
  being changed (copy it verbatim from the input). For "add", "originalText" must be null.
- Prefer a small number of high-value, well-justified changes over many trivial ones.
- Do not propose changes to dates, company names, or job titles — only to how
  achievements and skills are described and emphasized.
- "rationale" should reference the specific requirement or gap this change addresses.`

export async function generateResumeProposals(
  userId: string,
  input: { resumeVersionId: string; opportunityId: string },
  promptContent: string
): Promise<ReturnType<typeof runAiTask<ResumeProposalsResult>>> {
  return runAiTask({
    userId,
    type: "resume_proposal",
    inputEntityIds: { resumeVersionId: input.resumeVersionId, opportunityId: input.opportunityId },
    taskInstructions: TASK_INSTRUCTIONS,
    userContent: promptContent,
    schema: resumeProposalsResultSchema,
    maxTokens: 6144,
    creditCost: 3,
  })
}
