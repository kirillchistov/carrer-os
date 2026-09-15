import type { LlmProvider } from "./provider"
import { AnthropicProvider } from "./anthropic-provider"

let cached: LlmProvider | null | undefined

/** Returns null when no AI provider is configured (e.g. ANTHROPIC_API_KEY unset in
 *  this environment) — callers must handle that as a normal "AI unavailable" state,
 *  not an error, since manual entry is always a valid fallback per the product spec. */
export function getLlmProvider(): LlmProvider | null {
  if (cached !== undefined) return cached

  const apiKey = process.env.ANTHROPIC_API_KEY
  cached = apiKey ? new AnthropicProvider(apiKey) : null
  return cached
}
