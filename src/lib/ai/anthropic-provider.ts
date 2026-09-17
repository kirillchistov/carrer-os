import Anthropic from "@anthropic-ai/sdk"
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod"
import type { LlmProvider, StructuredGenerationRequest, StructuredGenerationResult } from "./provider"

const MODEL = "claude-opus-5"

export class AnthropicProvider implements LlmProvider {
  readonly name = "anthropic"
  readonly model = MODEL
  private client: Anthropic

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey })
  }

  async generateStructured<T>(
    request: StructuredGenerationRequest<T>
  ): Promise<StructuredGenerationResult<T>> {
    const response = await this.client.messages.parse({
      model: request.model ?? this.model,
      max_tokens: request.maxTokens ?? 4096,
      system: request.system,
      messages: [{ role: "user", content: request.prompt }],
      output_config: { format: zodOutputFormat(request.schema) },
    })

    return {
      data: response.parsed_output,
      provider: this.name,
      model: request.model ?? this.model,
    }
  }
}
