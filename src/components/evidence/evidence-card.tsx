"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { Evidence } from "@prisma/client"
import { Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AiFeedbackButton } from "@/components/ai/ai-feedback-button"
import { EvidenceForm } from "@/components/evidence/evidence-form"
import { deleteEvidence, requestEvidenceGapSuggestions, updateEvidence } from "@/lib/actions/evidence"
import type { EvidenceGapSuggestion } from "@/lib/validation/evidence"

type Option = { id: string; label: string }

export function EvidenceCard({
  evidence,
  careerTrackOptions,
  experienceOptions,
}: {
  evidence: Evidence
  careerTrackOptions: Option[]
  experienceOptions: Option[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()
  const [gapResult, setGapResult] = useState<{ aiRunId: string; data: EvidenceGapSuggestion } | null>(null)
  const [gapError, setGapError] = useState<string | null>(null)

  function requestGaps() {
    setGapError(null)
    startTransition(async () => {
      const result = await requestEvidenceGapSuggestions(evidence.id)
      if (result.ok) {
        setGapResult({ aiRunId: result.aiRunId, data: result.data })
      } else {
        setGapError(result.message)
      }
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <p className="font-medium">{evidence.title}</p>
          {evidence.timeframe && <p className="text-sm text-muted-foreground">{evidence.timeframe}</p>}
        </div>
        <div className="flex w-32 flex-col items-end gap-1">
          <span className="text-xs text-muted-foreground">Полнота: {evidence.qualityScore ?? 0}%</span>
          <Progress value={evidence.qualityScore ?? 0} className="h-1.5 w-full" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {evidence.result && <p className="text-sm">{evidence.result}</p>}
        {evidence.qualityExplanation && (
          <p className="text-xs text-muted-foreground">{evidence.qualityExplanation}</p>
        )}
        {(evidence.skills.length > 0 || evidence.industries.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {[...evidence.skills, ...evidence.industries].map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {gapResult && (
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            {gapResult.data.missingSignals.length > 0 && (
              <ul className="list-disc pl-4">
                {gapResult.data.missingSignals.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
            {gapResult.data.suggestions.length > 0 && (
              <ul className="mt-2 list-disc pl-4 text-muted-foreground">
                {gapResult.data.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
            <AiFeedbackButton
              aiRunId={gapResult.aiRunId}
              targetType="evidence"
              targetId={evidence.id}
              className="mt-1 px-0"
            />
          </div>
        )}
        {gapError && <p className="text-sm text-destructive">{gapError}</p>}

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" disabled={pending} onClick={requestGaps}>
            <Sparkles className="size-3.5" />
            {pending ? "Анализируем..." : "Что можно улучшить?"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            Редактировать
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              if (confirm("Удалить это доказательство?")) {
                startTransition(async () => {
                  await deleteEvidence(evidence.id)
                  router.refresh()
                })
              }
            }}
          >
            Удалить
          </Button>
        </div>
      </CardContent>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Редактировать доказательство</DialogTitle>
          </DialogHeader>
          <EvidenceForm
            defaultValues={{
              title: evidence.title,
              careerTrackId: evidence.careerTrackId,
              experienceId: evidence.experienceId,
              situation: evidence.situation,
              task: evidence.task,
              action: evidence.action,
              result: evidence.result,
              metricValue: evidence.metricValue,
              metricUnit: evidence.metricUnit,
              metricDescription: evidence.metricDescription,
              timeframe: evidence.timeframe,
              scaleDescription: evidence.scaleDescription,
              teamSize: evidence.teamSize,
              budgetDescription: evidence.budgetDescription,
              pAndLDescription: evidence.pAndLDescription,
              industries: evidence.industries,
              skills: evidence.skills,
              isReusableInResume: evidence.isReusableInResume,
              isReusableInInterview: evidence.isReusableInInterview,
              isReusableInOutreach: evidence.isReusableInOutreach,
            }}
            careerTrackOptions={careerTrackOptions}
            experienceOptions={experienceOptions}
            onSubmit={async (values) => {
              await updateEvidence(evidence.id, values)
              setEditing(false)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
