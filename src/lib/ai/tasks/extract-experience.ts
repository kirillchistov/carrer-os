import { runAiTask } from "@/lib/ai/run-ai-task"
import {
  experienceExtractionResultSchema,
  type ExperienceExtractionResult,
} from "@/lib/validation/experience"

const TASK_INSTRUCTIONS = `Task: extract work experience entries from the résumé/CV text the user provides.

- Return one entry per distinct role (a person who changed titles within the same
  company is two entries).
- "responsibilities" is a list of short bullet points taken from the text — do not
  invent responsibilities not stated or clearly implied by the text.
- "isCurrent" is true only if the text explicitly says the role is current (e.g.
  "present", "по настоящее время") — otherwise false.
- If the input contains no identifiable work experience, return an empty "experiences"
  array and explain why in "notes".`

export async function extractExperienceFromText(
  userId: string,
  rawText: string
): Promise<ReturnType<typeof runAiTask<ExperienceExtractionResult>>> {
  return runAiTask({
    userId,
    type: "experience_extraction",
    inputEntityIds: {},
    taskInstructions: TASK_INSTRUCTIONS,
    userContent: rawText,
    schema: experienceExtractionResultSchema,
    maxTokens: 8192,
  })
}
