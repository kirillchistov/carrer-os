import { createHash } from "node:crypto"
import type { ZodType } from "zod"
import type { AiRunType } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"
import { getLlmProvider } from "./get-provider"
import { SAFETY_PREAMBLE } from "./safety-preamble"
import { modelForAiRunType } from "./models"

const DEFAULT_CREDIT_COST = 1
const PROMPT_VERSION = "2026-09-1"

export type RunAiTaskInput<T> = {
  userId: string
  type: AiRunType
  /** IDs of the records this task was allowed to read — audit trail, not access control. */
  inputEntityIds: Record<string, string | string[] | null>
  /** Task-specific instructions, appended after the shared safety preamble. */
  taskInstructions: string
  /** The user-supplied content the task works from (resume text, evidence fields, etc.). */
  userContent: string
  schema: ZodType<T>
  creditCost?: number
  maxTokens?: number
}

export type RunAiTaskResult<T> =
  | { ok: true; data: T; aiRunId: string }
  | {
      ok: false
      aiRunId: string | null
      error: "not_configured" | "insufficient_credits" | "generation_failed"
      message: string
    }

function hashInput(type: string, promptVersion: string, userContent: string): string {
  return createHash("sha256").update(`${type}:${promptVersion}:${userContent}`).digest("hex")
}

/**
 * The single choke point every AI call goes through: checks/debits credits, injects the
 * shared safety preamble, validates the model's output against the caller's Zod schema,
 * and writes an AiRun audit row — so those rules are structural, not a convention each
 * call site has to remember. See docs/product-plan.md, "AI safety".
 */
export async function runAiTask<T>(input: RunAiTaskInput<T>): Promise<RunAiTaskResult<T>> {
  const provider = getLlmProvider()
  if (!provider) {
    return {
      ok: false,
      aiRunId: null,
      error: "not_configured",
      message: "AI-функции временно недоступны — можно продолжить вручную.",
    }
  }

  const cost = input.creditCost ?? DEFAULT_CREDIT_COST
  const inputHash = hashInput(input.type, PROMPT_VERSION, input.userContent)

  const aiRunId = await prisma.$transaction(async (tx) => {
    const debited = await tx.creditAccount.updateMany({
      where: { userId: input.userId, balance: { gte: cost } },
      data: { balance: { decrement: cost } },
    })
    if (debited.count === 0) {
      return null
    }

    const aiRun = await tx.aiRun.create({
      data: {
        userId: input.userId,
        type: input.type,
        inputEntityIds: input.inputEntityIds,
        inputHash,
        provider: provider.name,
        model: modelForAiRunType(input.type),
        promptVersion: PROMPT_VERSION,
        status: "pending",
      },
    })

    await tx.creditTransaction.create({
      data: {
        userId: input.userId,
        amount: -cost,
        reason: "ai_run_debit",
        aiRunId: aiRun.id,
      },
    })

    return aiRun.id
  })

  if (!aiRunId) {
    return {
      ok: false,
      aiRunId: null,
      error: "insufficient_credits",
      message: "Недостаточно AI-кредитов. Баланс — в Настройках; пополнение пока недоступно.",
    }
  }

  try {
    const result = await provider.generateStructured({
      system: `${SAFETY_PREAMBLE}\n\n${input.taskInstructions}`,
      prompt: input.userContent,
      schema: input.schema,
      maxTokens: input.maxTokens,
      model: modelForAiRunType(input.type),
    })

    if (result.data === null) {
      await failAndRefund(aiRunId, input.userId, cost, "Модель вернула данные, не соответствующие ожидаемой схеме.")
      return {
        ok: false,
        aiRunId,
        error: "generation_failed",
        message: "Не удалось разобрать ответ AI. Попробуйте ещё раз или продолжите вручную.",
      }
    }

    await prisma.aiRun.update({
      where: { id: aiRunId },
      data: { status: "success", output: result.data as object, completedAt: new Date() },
    })

    return { ok: true, data: result.data, aiRunId }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    await failAndRefund(aiRunId, input.userId, cost, message)
    return {
      ok: false,
      aiRunId,
      error: "generation_failed",
      message: "Не удалось получить ответ от AI. Попробуйте ещё раз или продолжите вручную.",
    }
  }
}

async function failAndRefund(aiRunId: string, userId: string, cost: number, errorMessage: string) {
  await prisma.$transaction([
    prisma.aiRun.update({
      where: { id: aiRunId },
      data: { status: "failed", errorMessage, completedAt: new Date() },
    }),
    prisma.creditAccount.update({
      where: { userId },
      data: { balance: { increment: cost } },
    }),
    prisma.creditTransaction.create({
      data: { userId, amount: cost, reason: "refund", aiRunId },
    }),
  ])
}
