import type { ZodType } from "zod"

export type StructuredGenerationRequest<T> = {
  system: string
  prompt: string
  schema: ZodType<T>
  maxTokens?: number
}

export type StructuredGenerationResult<T> = {
  data: T | null
  provider: string
  model: string
}

export interface LlmProvider {
  readonly name: string
  readonly model: string
  generateStructured<T>(request: StructuredGenerationRequest<T>): Promise<StructuredGenerationResult<T>>
}
