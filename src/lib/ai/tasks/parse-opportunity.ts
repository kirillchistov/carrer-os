import { runAiTask } from "@/lib/ai/run-ai-task"
import { opportunityParseResultSchema, type OpportunityParseResult } from "@/lib/validation/opportunity"

const TASK_INSTRUCTIONS = `Task: structure a job/project/fractional/advisory opportunity from its raw text
(pasted by the user, or extracted from a web page they linked).

- "type" should be your best read of the opportunity kind: vacancy, project, fractional,
  advisory, or proactive_lead — null if genuinely unclear.
- "requirements" should list distinct requirements, each tagged with a category
  (responsibility, skill, tool, qualification, industry_experience, logistics, other) and
  an importance: "must_have" only when the text explicitly signals it's required (e.g.
  "required", "must have", "обязательно"), "nice_to_have" when explicitly optional/a plus,
  and "inferred_context" for things that are clearly relevant but not stated as a hard
  requirement (e.g. company size, industry, team structure mentioned in passing).
- Do not invent a compensation range, location, or company name that isn't in the text.
- "summary" is a neutral 2-3 sentence description of the opportunity, not a sales pitch.`

export async function parseOpportunityText(
  userId: string,
  rawText: string
): Promise<ReturnType<typeof runAiTask<OpportunityParseResult>>> {
  return runAiTask({
    userId,
    type: "opportunity_parse",
    inputEntityIds: {},
    taskInstructions: TASK_INSTRUCTIONS,
    userContent: rawText,
    schema: opportunityParseResultSchema,
    maxTokens: 4096,
  })
}
