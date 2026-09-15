"use server"

import { z } from "zod"
import type { AiFeedbackTargetType } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"
import { requireCurrentUser } from "@/lib/auth/session"

const fileAiFeedbackSchema = z.object({
  aiRunId: z.string().nullable(),
  targetType: z.enum([
    "ai_run",
    "experience",
    "evidence",
    "opportunity_requirement",
    "resume_change_proposal",
    "fit_assessment_dimension",
    "interview_learning",
  ]),
  targetId: z.string().nullable(),
  comment: z.string().max(2000).nullable(),
})

export type FileAiFeedbackInput = {
  aiRunId: string | null
  targetType: AiFeedbackTargetType
  targetId: string | null
  comment: string | null
}

export async function fileAiFeedback(input: FileAiFeedbackInput) {
  const user = await requireCurrentUser()
  const parsed = fileAiFeedbackSchema.parse(input)

  await prisma.aiFeedbackReport.create({
    data: {
      userId: user.id,
      aiRunId: parsed.aiRunId,
      targetType: parsed.targetType,
      targetId: parsed.targetId,
      comment: parsed.comment,
    },
  })

  return { ok: true as const }
}
