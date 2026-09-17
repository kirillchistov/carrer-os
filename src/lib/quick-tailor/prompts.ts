import type { ClarifyingAnswer } from "@/lib/validation/quick-tailor"

export function buildQuickTailorMatchPrompt(resumeText: string, job: { title: string; companyName: string; text: string }): string {
  return [
    `## Candidate resume (source of truth — do not invent facts beyond this text)`,
    resumeText,
    ``,
    `## Target vacancy`,
    `${job.title || "(title unknown)"} — ${job.companyName || "(company unknown)"}`,
    job.text,
  ].join("\n")
}

export function buildQuickTailorGeneratePrompt(input: {
  resumeText: string
  job: { title: string; companyName: string; text: string }
  answers: ClarifyingAnswer[]
}): string {
  const answered = input.answers.filter((a) => a.answer.trim().length > 0)
  const answerBlock =
    answered.length === 0
      ? "(none — work only from the resume text)"
      : answered.map((a) => `Q: ${a.prompt}\nA: ${a.answer.trim()}`).join("\n\n")

  return [
    `## Candidate resume (source of truth)`,
    input.resumeText,
    ``,
    `## Target vacancy`,
    `${input.job.title} — ${input.job.companyName}`,
    input.job.text,
    ``,
    `## Candidate answers to clarifying questions (additional allowed facts; still do not invent anything else)`,
    answerBlock,
  ].join("\n")
}
