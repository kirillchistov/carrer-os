export function questionsToJson(questions: string | null): string[] {
  return questions
    ? questions
        .split("\n")
        .map((q) => q.trim())
        .filter(Boolean)
    : []
}

export function questionsFromJson(questions: unknown): string | null {
  return Array.isArray(questions) ? (questions as string[]).join("\n") : null
}
