import type { QuickTailorMatch } from "@/lib/validation/quick-tailor"

export function summarizeMatch(match: QuickTailorMatch) {
  const full = match.requirements.filter((r) => r.coverage === "full").length
  const partial = match.requirements.filter((r) => r.coverage === "partial").length
  const missing = match.requirements.filter((r) => r.coverage === "missing").length
  return { full, partial, missing, total: match.requirements.length }
}

export function creditWord(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return "кредит"
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "кредита"
  return "кредитов"
}

export function creditLabel(n: number): string {
  return `${n} ${creditWord(n)}`
}
