"use client"

import { useMemo, useState, useTransition } from "react"
import { Sparkles } from "lucide-react"
import type { FitAssessment } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AiFeedbackButton } from "@/components/ai/ai-feedback-button"
import { FitDimensionCard } from "@/components/fit/fit-dimension-card"
import { generateFitAssessment, getLatestFitAssessment } from "@/lib/actions/fit-assessment"
import { FIT_OVERALL_LABELS, fitAssessmentResultSchema, type FitDimensionResult } from "@/lib/validation/fit-assessment"

type Option = { id: string; title: string }

type RecommendedActions = {
  whyYouFit: string
  evidenceToEmphasize: string[]
  resumeChangesRecommended: string[]
  outreachAngle: string
  nextBestAction: string
}

export function FitReportClient({
  opportunityId,
  careerTracks,
  initialTrackId,
  initialAssessment,
  evidenceTitles,
  requirementTexts,
}: {
  opportunityId: string
  careerTracks: Option[]
  initialTrackId: string | null
  initialAssessment: FitAssessment | null
  evidenceTitles: Record<string, string>
  requirementTexts: Record<string, string>
}) {
  const [trackId, setTrackId] = useState(initialTrackId)
  const [assessment, setAssessment] = useState(initialAssessment)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const evidenceMap = useMemo(() => new Map(Object.entries(evidenceTitles)), [evidenceTitles])
  const requirementMap = useMemo(() => new Map(Object.entries(requirementTexts)), [requirementTexts])

  function handleTrackChange(value: string) {
    setTrackId(value)
    setError(null)
    startTransition(async () => {
      const existing = await getLatestFitAssessment(opportunityId, value)
      setAssessment(existing)
    })
  }

  function handleGenerate() {
    if (!trackId) return
    setError(null)
    startTransition(async () => {
      const result = await generateFitAssessment(opportunityId, trackId)
      if (!result.ok) {
        setError(result.message)
        return
      }
      const fresh = await getLatestFitAssessment(opportunityId, trackId)
      setAssessment(fresh)
    })
  }

  if (careerTracks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Сначала создайте хотя бы один активный карьерный трек в разделе Career Tracks.
      </p>
    )
  }

  const dimensions = assessment ? parseDimensions(assessment.dimensionResults) : null
  const gaps = assessment ? parseStringArray(assessment.gaps) : []
  const questions = assessment ? parseStringArray(assessment.questions) : []
  const actions = assessment ? parseRecommendedActions(assessment.recommendedActions) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={trackId ?? undefined} onValueChange={(v) => v && handleTrackChange(v)}>
          <SelectTrigger className="w-64">
            <SelectValue>{(value: string | null) => careerTracks.find((t) => t.id === value)?.title}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {careerTracks.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleGenerate} disabled={pending || !trackId}>
          <Sparkles className="size-4" />
          {pending ? "Готовим отчёт..." : assessment ? "Обновить Fit Report" : "Сгенерировать Fit Report"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!assessment && !pending && (
        <p className="text-sm text-muted-foreground">
          Отчёт ещё не создавался для этого трека. Это не предсказание интервью или оффера —
          только объяснимая навигация по 10 измерениям.
        </p>
      )}

      {assessment && dimensions && actions && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">
                {FIT_OVERALL_LABELS[assessment.overallLabel]}
                {assessment.overallScore !== null && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    (навигационный индикатор: {assessment.overallScore}/100)
                  </span>
                )}
              </CardTitle>
              <AiFeedbackButton aiRunId={assessment.aiRunId} targetType="fit_assessment_dimension" targetId={assessment.id} />
            </CardHeader>
            <CardContent>
              <p className="text-sm">{actions.whyYouFit}</p>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            {dimensions.map((dim) => (
              <FitDimensionCard
                key={dim.dimension}
                result={dim}
                evidenceTitles={evidenceMap}
                requirementTexts={requirementMap}
              />
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Пробелы и риски</CardTitle>
              </CardHeader>
              <CardContent>
                {gaps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Явных пробелов не выявлено.</p>
                ) : (
                  <ul className="list-disc pl-5 text-sm">
                    {gaps.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Вопросы для уточнения у работодателя</CardTitle>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Вопросов не предложено.</p>
                ) : (
                  <ul className="list-disc pl-5 text-sm">
                    {questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Рекомендации по резюме</CardTitle>
              </CardHeader>
              <CardContent>
                {actions.resumeChangesRecommended.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Изменений не предложено.</p>
                ) : (
                  <ul className="list-disc pl-5 text-sm">
                    {actions.resumeChangesRecommended.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Угол для outreach-сообщения</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <p>{actions.outreachAngle}</p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Следующий шаг: </span>
                  {actions.nextBestAction}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function parseDimensions(json: unknown): FitDimensionResult[] {
  const parsed = fitAssessmentResultSchema.shape.dimensions.safeParse(json)
  return parsed.success ? parsed.data : []
}

function parseStringArray(json: unknown): string[] {
  return Array.isArray(json) ? json.filter((x): x is string => typeof x === "string") : []
}

function parseRecommendedActions(json: unknown): RecommendedActions | null {
  if (!json || typeof json !== "object") return null
  const obj = json as Record<string, unknown>
  return {
    whyYouFit: typeof obj.whyYouFit === "string" ? obj.whyYouFit : "",
    evidenceToEmphasize: parseStringArray(obj.evidenceToEmphasize),
    resumeChangesRecommended: parseStringArray(obj.resumeChangesRecommended),
    outreachAngle: typeof obj.outreachAngle === "string" ? obj.outreachAngle : "",
    nextBestAction: typeof obj.nextBestAction === "string" ? obj.nextBestAction : "",
  }
}
