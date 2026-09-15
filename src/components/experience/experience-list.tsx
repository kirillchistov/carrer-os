"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Experience } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { VerificationBadge } from "@/components/shared/verification-badge"
import { AiFeedbackButton } from "@/components/ai/ai-feedback-button"
import { ExperienceForm } from "@/components/experience/experience-form"
import {
  deleteExperience,
  rejectExperience,
  updateExperience,
  verifyExperience,
} from "@/lib/actions/experience"
import { formatDateForMonthInput, type ExperienceFormValues } from "@/lib/validation/experience"

function toFormValues(exp: Experience): ExperienceFormValues {
  return {
    companyName: exp.companyName,
    companyIndustry: exp.companyIndustry,
    title: exp.title,
    employmentType: exp.employmentType,
    startDate: exp.startDate ? formatDateForMonthInput(new Date(exp.startDate)) : null,
    endDate: exp.endDate ? formatDateForMonthInput(new Date(exp.endDate)) : null,
    isCurrent: exp.isCurrent,
    location: exp.location,
    description: exp.description,
    responsibilities: exp.responsibilities,
    teamSize: exp.teamSize,
    budgetDescription: exp.budgetDescription,
  }
}

function formatRange(exp: Experience) {
  const fmt = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString("ru-RU", { month: "short", year: "numeric" }) : "?"
  return `${fmt(exp.startDate)} — ${exp.isCurrent ? "настоящее время" : fmt(exp.endDate)}`
}

export function ExperienceList({ experiences }: { experiences: Experience[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Experience | null>(null)
  const [pending, startTransition] = useTransition()

  function withRefresh(action: () => Promise<unknown>) {
    startTransition(async () => {
      await action()
      router.refresh()
    })
  }

  if (experiences.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Опыта пока нет — импортируйте резюме выше или добавьте роль вручную.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {experiences.map((exp) => (
        <Card key={exp.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <p className="font-medium">
                {exp.title} — {exp.companyName}
              </p>
              <p className="text-sm text-muted-foreground">{formatRange(exp)}</p>
            </div>
            <VerificationBadge status={exp.verificationStatus} />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {exp.description && <p className="text-sm">{exp.description}</p>}
            {exp.responsibilities.length > 0 && (
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {exp.responsibilities.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {exp.verificationStatus === "unverified" && (
                <>
                  <Button size="sm" disabled={pending} onClick={() => withRefresh(() => verifyExperience(exp.id))}>
                    Подтвердить
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => withRefresh(() => rejectExperience(exp.id))}
                  >
                    Отклонить
                  </Button>
                  <AiFeedbackButton aiRunId={null} targetType="experience" targetId={exp.id} />
                </>
              )}
              <Button size="sm" variant="ghost" onClick={() => setEditing(exp)}>
                Редактировать
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                disabled={pending}
                onClick={() => {
                  if (confirm("Удалить эту запись об опыте?")) {
                    withRefresh(() => deleteExperience(exp.id))
                  }
                }}
              >
                Удалить
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Редактировать опыт</DialogTitle>
          </DialogHeader>
          {editing && (
            <ExperienceForm
              defaultValues={toFormValues(editing)}
              onSubmit={async (values) => {
                await updateExperience(editing.id, values)
                toast.success("Сохранено")
                setEditing(null)
                router.refresh()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
