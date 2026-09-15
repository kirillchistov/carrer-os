import { runAiTask } from "@/lib/ai/run-ai-task"
import { evidenceGapSuggestionSchema, type EvidenceGapSuggestion } from "@/lib/validation/evidence"

const TASK_INSTRUCTIONS = `Task: look at one evidence/achievement card (CAR/STAR structure: situation, task,
action, result, metric) and point out what's missing or unclear — not to rewrite it,
only to help the user see gaps.

Examples of the kind of distinctions to make explicit in "missingSignals":
- "Есть действие, но нет результата"
- "Есть результат, но неясен личный вклад"
- "Есть цифра, но неясна единица измерения"

"suggestions" should be short, concrete questions the user could answer to fill each gap
— not a rewritten version of their text.`

export async function suggestEvidenceGaps(
  userId: string,
  evidenceId: string,
  cardText: string
): Promise<ReturnType<typeof runAiTask<EvidenceGapSuggestion>>> {
  return runAiTask({
    userId,
    type: "evidence_quality_suggestion",
    inputEntityIds: { evidenceId },
    taskInstructions: TASK_INSTRUCTIONS,
    userContent: cardText,
    schema: evidenceGapSuggestionSchema,
    maxTokens: 2048,
  })
}
