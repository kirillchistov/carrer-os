import { runAiTask } from "@/lib/ai/run-ai-task"
import { positioningDraftSchema, type PositioningDraft } from "@/lib/validation/career-track"

const TASK_INSTRUCTIONS = `Task: draft a positioning statement for one career track, from the track's target
fields and a short summary of the candidate's relevant evidence, both given below.

Follow this formula for "valueProposition": "I help [type of company] solve [business
problem] through [competencies], backed by [a concrete result]." Ground every claim in
the evidence given — if there isn't evidence for a strong claim, write a more modest one
instead of inventing a result.

This is a DRAFT for the user to edit, not a final statement — write in their voice as
best you can infer it from the input, not a generic template.`

export async function draftPositioning(
  userId: string,
  careerTrackId: string,
  inputSummary: string
): Promise<ReturnType<typeof runAiTask<PositioningDraft>>> {
  return runAiTask({
    userId,
    type: "positioning_draft",
    inputEntityIds: { careerTrackId },
    taskInstructions: TASK_INSTRUCTIONS,
    userContent: inputSummary,
    schema: positioningDraftSchema,
    maxTokens: 2048,
  })
}
