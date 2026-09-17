"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ResumeContent } from "@/lib/validation/resume"

export function ResumePreviewEditor({
  content,
  onChange,
}: {
  content: ResumeContent
  onChange: (next: ResumeContent) => void
}) {
  function updateExperience(index: number, patch: Partial<ResumeContent["experience"][number]>) {
    onChange({
      ...content,
      experience: content.experience.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    })
  }

  function updateBullets(index: number, bulletsText: string) {
    const bullets = bulletsText
      .split("\n")
      .map((line) => line.replace(/^\s*[•\-–]\s*/, "").trim())
      .filter(Boolean)
    updateExperience(index, { bullets })
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1.5">
        <p className="font-medium">О себе</p>
        <Textarea
          value={content.summary}
          rows={4}
          onChange={(e) => onChange({ ...content, summary: e.target.value })}
        />
      </div>

      {content.experience.map((entry, i) => (
        <div key={`${entry.company}-${i}`} className="flex flex-col gap-2 rounded-md border p-3">
          <Input
            value={entry.title}
            onChange={(e) => updateExperience(i, { title: e.target.value })}
            aria-label="Должность"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              value={entry.company}
              onChange={(e) => updateExperience(i, { company: e.target.value })}
              aria-label="Компания"
            />
            <Input
              value={entry.period}
              onChange={(e) => updateExperience(i, { period: e.target.value })}
              aria-label="Период"
            />
          </div>
          <Textarea
            value={entry.bullets.join("\n")}
            rows={Math.max(3, entry.bullets.length + 1)}
            onChange={(e) => updateBullets(i, e.target.value)}
            aria-label="Достижения"
          />
        </div>
      ))}

      {content.skills.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="font-medium">Навыки</p>
          <Textarea
            value={content.skills.join(", ")}
            rows={2}
            onChange={(e) =>
              onChange({
                ...content,
                skills: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
      )}

      {content.education.length > 0 && (
        <div>
          <p className="mb-1 font-medium">Образование</p>
          <ul className="list-disc pl-5 text-muted-foreground">
            {content.education.map((e, i) => (
              <li key={i}>
                {e.degree} — {e.institution} ({e.year})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
