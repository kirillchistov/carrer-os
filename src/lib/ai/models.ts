import type { AiRunType } from "@prisma/client"

const FAST_MODEL = process.env.ANTHROPIC_FAST_MODEL ?? "claude-sonnet-4-5"
const QUALITY_MODEL = process.env.ANTHROPIC_QUALITY_MODEL ?? "claude-opus-5"

const QUALITY_TYPES: AiRunType[] = ["resume_proposal", "outreach_draft"]

export function modelForAiRunType(type: AiRunType): string {
  return QUALITY_TYPES.includes(type) ? QUALITY_MODEL : FAST_MODEL
}
