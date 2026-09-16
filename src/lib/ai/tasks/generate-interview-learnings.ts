import { runAiTask } from "@/lib/ai/run-ai-task"
import { interviewLearningsResultSchema, type InterviewLearningsResult } from "@/lib/validation/interview-learning"

const TASK_INSTRUCTIONS = `Task: read one interview record (notes, feedback, interviewer signals) and extract
reusable learnings for the candidate's Evidence Bank and Career Track definitions.

Rules specific to this task:
- Ground everything strictly in the interview notes/feedback/signals text given to you. This
  text is the candidate's own account of the conversation — do not add facts, numbers, or
  claims that are not stated in it, and do not infer what the interviewer "really meant."
- "evidenceDrafts": only include an item when the notes describe something the CANDIDATE did
  or achieved that could stand as a proof point (a story they told, a result they mentioned).
  Do not turn the interviewer's opinions or the company's plans into evidence about the
  candidate. Leave situation/task/action/result null rather than inventing content to fill
  them. metricValue must be null unless a specific number appears in the notes.
- "careerTrackSuggestions": only suggest an addition when the notes show a clear, repeated
  signal — an objection raised more than once suggests a possible missing
  "mustHaveSkills" entry to address in positioning; a business need the interviewer described
  suggests a "businessProblems" entry; an industry mentioned as attractive suggests
  "targetIndustries". Each suggestion's rationale must point to the specific part of the
  notes it comes from. When nothing in the notes clearly supports a suggestion, return an
  empty array rather than guessing.
- "summary" must stay factual and neutral — no motivational framing, no predicting the
  outcome of the process.
- Write in the same language as the interview notes given to you.`

export async function generateInterviewLearnings(
  userId: string,
  interviewId: string,
  promptContent: string
): Promise<ReturnType<typeof runAiTask<InterviewLearningsResult>>> {
  return runAiTask({
    userId,
    type: "interview_learning",
    inputEntityIds: { interviewId },
    taskInstructions: TASK_INSTRUCTIONS,
    userContent: promptContent,
    schema: interviewLearningsResultSchema,
    maxTokens: 3072,
    creditCost: 2,
  })
}
