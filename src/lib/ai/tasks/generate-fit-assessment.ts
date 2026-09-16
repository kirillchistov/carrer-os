import { runAiTask } from "@/lib/ai/run-ai-task"
import { fitAssessmentResultSchema, type FitAssessmentResult } from "@/lib/validation/fit-assessment"

const TASK_INSTRUCTIONS = `Task: produce an explainable fit assessment between one candidate and one opportunity,
across exactly these 10 dimensions: role_fit, industry_fit, business_problem_fit,
leadership_scale_fit, skills_tools_fit, employment_format_fit, logistics_fit,
evidence_strength_fit, motivation_risk_fit, freshness_fit. Return all 10, even when the
status is "unknown".

You will be given, in the user content: the opportunity, its requirements (each with an
id), the candidate's career track, a list of their evidence cards (each with an id), and
a block of "confirmed facts" already computed by deterministic code (skill matches,
format/location matches, evidence counts). Treat the confirmed facts as ground truth —
never contradict them, and cite them in your summaries instead of re-deriving them.

Rules specific to this task:
- Every "evidenceIds" and "requirementIds" you return MUST come from the ids given to
  you. Never invent an id, and never invent an evidence claim not present in the given
  evidence text.
- "status": "strong" only when there is real evidence or a confirmed match; "partial"
  when there's a plausible but unconfirmed connection; "gap" only for a genuine, stated
  mismatch — do not call something a gap just because it wasn't explicitly mentioned;
  "unknown" when the input simply doesn't say.
- For "motivation_risk_fit": assess overqualification/why-this-role risk only from what
  the candidate's own profile says about their motivation and non-negotiables — never
  infer motivation from titles, tenure, or any age-adjacent signal.
- For "freshness_fit": judge only from stated dates/timeframes and explicitly-mentioned
  tools or methods — never comment on the candidate's age or how long ago they started
  their career.
- Distinguish in your recommendations between: (a) something that can be fixed by
  rewording existing evidence, (b) something the existing evidence already proves but
  wasn't surfaced, (c) something that needs the employer to clarify, and (d) a genuine
  gap that should not be masked.
- "overallScore" is a rough navigational indicator, not a prediction — never imply it
  predicts an interview or an offer.`

export async function generateFitAssessment(
  userId: string,
  input: { opportunityId: string; careerTrackId: string },
  promptContent: string
): Promise<ReturnType<typeof runAiTask<FitAssessmentResult>>> {
  return runAiTask({
    userId,
    type: "fit_assessment",
    inputEntityIds: { opportunityId: input.opportunityId, careerTrackId: input.careerTrackId },
    taskInstructions: TASK_INSTRUCTIONS,
    userContent: promptContent,
    schema: fitAssessmentResultSchema,
    maxTokens: 8192,
    creditCost: 3,
  })
}
