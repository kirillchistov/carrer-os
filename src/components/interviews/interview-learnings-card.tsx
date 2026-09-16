"use client"

import { useState, useTransition } from "react"
import { Sparkles, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AiFeedbackButton } from "@/components/ai/ai-feedback-button"
import {
  requestInterviewLearnings,
  applyEvidenceDraft,
  applyCareerTrackSuggestion,
} from "@/lib/actions/interviews"
import type { InterviewLearningsResult } from "@/lib/validation/interview-learning"
import { CAREER_TRACK_SUGGESTION_FIELD_LABELS } from "@/lib/validation/interview-learning"

type Option = { id: string; label: string }

export function InterviewLearningsCard({
  interviewId,
  initialLearnings,
  careerTrackOptions,
}: {
  interviewId: string
  initialLearnings: InterviewLearningsResult | null
  careerTrackOptions: Option[]
}) {
  const [learnings, setLearnings] = useState(initialLearnings)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [appliedEvidence, setAppliedEvidence] = useState<Set<number>>(new Set())
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set())
  const [selectedTrack, setSelectedTrack] = useState<string | undefined>(careerTrackOptions[0]?.id)

  function handleGenerate() {
    setError(null)
    startTransition(async () => {
      const result = await requestInterviewLearnings(interviewId)
      if (!result.ok) {
        setError(result.message)
        return
      }
      setLearnings(result.data)
      setAppliedEvidence(new Set())
      setAppliedSuggestions(new Set())
    })
  }

  function handleApplyEvidence(index: number) {
    if (!learnings) return
    startTransition(async () => {
      await applyEvidenceDraft(learnings.evidenceDrafts[index], interviewId)
      setAppliedEvidence((prev) => new Set(prev).add(index))
    })
  }

  function handleApplySuggestion(index: number) {
    if (!learnings || !selectedTrack) return
    const suggestion = learnings.careerTrackSuggestions[index]
    startTransition(async () => {
      await applyCareerTrackSuggestion(selectedTrack, suggestion.field, suggestion.value)
      setAppliedSuggestions((prev) => new Set(prev).add(index))
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">AI-инсайты из интервью</CardTitle>
        <CardDescription>
          Черновики для Evidence Bank и предложения по карьерным трекам — только на основе
          того, что записано в заметках выше. Каждый пункт нужно подтвердить вручную.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleGenerate} disabled={pending}>
            <Sparkles className="size-3.5" />
            {pending ? "Анализируем..." : learnings ? "Обновить инсайты" : "Получить инсайты"}
          </Button>
          {learnings && <AiFeedbackButton aiRunId={null} targetType="interview_learning" targetId={interviewId} />}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}

        {learnings && (
          <>
            <p className="text-sm text-muted-foreground">{learnings.summary}</p>

            {learnings.evidenceDrafts.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Черновики для Evidence Bank</h3>
                {learnings.evidenceDrafts.map((draft, i) => (
                  <div key={i} className="flex flex-col gap-1 rounded-lg border p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium">{draft.title}</span>
                      {appliedEvidence.has(i) ? (
                        <Badge variant="outline" className="gap-1 text-emerald-700">
                          <Check className="size-3" />
                          Добавлено
                        </Badge>
                      ) : (
                        <Button size="sm" variant="outline" disabled={pending} onClick={() => handleApplyEvidence(i)}>
                          Добавить в Evidence Bank
                        </Button>
                      )}
                    </div>
                    {draft.result && <p className="text-muted-foreground">{draft.result}</p>}
                    {draft.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {draft.skills.map((s) => (
                          <Badge key={s} variant="secondary">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {learnings.careerTrackSuggestions.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium">Предложения по карьерному треку</h3>
                  {careerTrackOptions.length > 0 && (
                    <Select value={selectedTrack} onValueChange={(v) => setSelectedTrack(v ?? undefined)}>
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Выберите трек">
                          {(value: string | null) => careerTrackOptions.find((t) => t.id === value)?.label}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {careerTrackOptions.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {careerTrackOptions.length === 0 && (
                  <p className="text-sm text-muted-foreground">Сначала создайте карьерный трек.</p>
                )}
                {learnings.careerTrackSuggestions.map((suggestion, i) => (
                  <div key={i} className="flex flex-col gap-1 rounded-lg border p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline">{CAREER_TRACK_SUGGESTION_FIELD_LABELS[suggestion.field]}</Badge>
                        <span className="ml-2 font-medium">{suggestion.value}</span>
                      </div>
                      {appliedSuggestions.has(i) ? (
                        <Badge variant="outline" className="gap-1 text-emerald-700">
                          <Check className="size-3" />
                          Добавлено
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pending || !selectedTrack}
                          onClick={() => handleApplySuggestion(i)}
                        >
                          Добавить в трек
                        </Button>
                      )}
                    </div>
                    <p className="text-muted-foreground">{suggestion.rationale}</p>
                  </div>
                ))}
              </div>
            )}

            {learnings.evidenceDrafts.length === 0 && learnings.careerTrackSuggestions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                В заметках не нашлось чётких сигналов для новых доказательств или изменений трека.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
