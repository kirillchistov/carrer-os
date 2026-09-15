"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { CareerTrack } from "@prisma/client"
import { Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AiFeedbackButton } from "@/components/ai/ai-feedback-button"
import { CareerTrackForm } from "@/components/career-tracks/career-track-form"
import { deleteCareerTrack, requestPositioningDraft, updateCareerTrack } from "@/lib/actions/career-tracks"
import type { CareerTrackFormValues, PositioningDraft } from "@/lib/validation/career-track"

export function CareerTrackCard({ careerTrack }: { careerTrack: CareerTrack }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()
  const [draft, setDraft] = useState<{ aiRunId: string; data: PositioningDraft } | null>(null)
  const [draftError, setDraftError] = useState<string | null>(null)

  function requestDraft() {
    setDraftError(null)
    startTransition(async () => {
      const result = await requestPositioningDraft(careerTrack.id)
      if (result.ok) {
        setDraft({ aiRunId: result.aiRunId, data: result.data })
        setEditing(true)
      } else {
        setDraftError(result.message)
      }
    })
  }

  const baseValues: CareerTrackFormValues = {
    title: careerTrack.title,
    alternativeTitles: draft?.data.alternativeTitles ?? careerTrack.alternativeTitles,
    employmentFormats: careerTrack.employmentFormats,
    targetIndustries: careerTrack.targetIndustries,
    targetCompanyTypes: careerTrack.targetCompanyTypes,
    targetCompanyStages: careerTrack.targetCompanyStages,
    targetCompanySizes: careerTrack.targetCompanySizes,
    businessProblems: careerTrack.businessProblems,
    mustHaveSkills: careerTrack.mustHaveSkills,
    deemphasizedExperience: careerTrack.deemphasizedExperience,
    valueProposition: draft?.data.valueProposition ?? careerTrack.valueProposition,
    motivationStatement: draft?.data.motivationStatement ?? careerTrack.motivationStatement,
    active: careerTrack.active,
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">{careerTrack.title}</CardTitle>
          {!careerTrack.active && (
            <Badge variant="secondary" className="mt-1">
              Неактивный
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {careerTrack.valueProposition ? (
          <p className="text-sm">{careerTrack.valueProposition}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Value proposition ещё не заполнено.</p>
        )}
        {careerTrack.mustHaveSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {careerTrack.mustHaveSkills.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        {draftError && <p className="text-sm text-destructive">{draftError}</p>}

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" disabled={pending} onClick={requestDraft}>
            <Sparkles className="size-3.5" />
            {pending ? "Готовим черновик..." : "Черновик позиционирования от AI"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            Редактировать
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              if (confirm("Удалить этот карьерный трек?")) {
                startTransition(async () => {
                  await deleteCareerTrack(careerTrack.id)
                  router.refresh()
                })
              }
            }}
          >
            Удалить
          </Button>
        </div>
      </CardContent>

      <Dialog
        open={editing}
        onOpenChange={(open) => {
          setEditing(open)
          if (!open) setDraft(null)
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Редактировать трек</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
              Поля value proposition, мотивации и альтернативных названий предзаполнены
              черновиком от AI — проверьте и отредактируйте перед сохранением.
              <AiFeedbackButton
                aiRunId={draft.aiRunId}
                targetType="ai_run"
                className="mt-1 block px-0"
              />
            </div>
          )}
          <CareerTrackForm
            key={draft ? "with-draft" : "without-draft"}
            defaultValues={baseValues}
            onSubmit={async (values) => {
              await updateCareerTrack(careerTrack.id, values)
              setEditing(false)
              setDraft(null)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
