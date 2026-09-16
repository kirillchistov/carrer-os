import type { ResumeContent } from "@/lib/validation/resume"

const TOP_LEVEL_LABELS: Record<string, string> = {
  summary: "Summary",
  achievements: "Достижения",
  skills: "Навыки",
  certifications: "Сертификаты",
  projects: "Проекты",
}

export function sectionLabel(section: string, content: ResumeContent | null): string {
  if (TOP_LEVEL_LABELS[section]) return TOP_LEVEL_LABELS[section]
  const match = /^experience\.(\d+)$/.exec(section)
  if (match) {
    const entry = content?.experience[Number(match[1])]
    return entry ? `Опыт: ${entry.title} — ${entry.company}` : `Опыт [${match[1]}]`
  }
  return section
}
