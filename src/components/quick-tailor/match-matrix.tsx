import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "cn"
import type { MatchCoverage, QuickTailorMatch } from "@/lib/validation/quick-tailor"
import { summarizeMatch } from "@/lib/quick-tailor/summary"
import { AiFeedbackButton } from "@/components/ai/ai-feedback-button"

const COVERAGE_LABEL: Record<MatchCoverage, string> = {
  full: "Полное совпадение",
  partial: "Частичное",
  missing: "Нет информации",
}

const COVERAGE_STYLE: Record<MatchCoverage, string> = {
  full: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  partial: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  missing: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
}

const ORDER: MatchCoverage[] = ["full", "partial", "missing"]

export function MatchMatrix({ match, aiRunId }: { match: QuickTailorMatch; aiRunId: string | null }) {
  const counts = summarizeMatch(match)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">Насколько резюме закрывает вакансию</CardTitle>
            <CardDescription>{match.summary}</CardDescription>
          </div>
          {aiRunId ? <AiFeedbackButton aiRunId={aiRunId} targetType="ai_run" /> : null}
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-sm">
          <span>
            <strong>{counts.full}</strong> полное
          </span>
          <span>
            <strong>{counts.partial}</strong> частичное
          </span>
          <span>
            <strong>{counts.missing}</strong> нет информации
          </span>
          <span className="text-muted-foreground">
            {counts.full + counts.partial} из {counts.total} требований с опорой на текст резюме
          </span>
        </CardContent>
      </Card>

      {(match.keywordHits.length > 0 || match.keywordMisses.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Формулировки вакансии</CardTitle>
            <CardDescription>Без процента ATS — только что уже есть в тексте и чего не видно.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {match.keywordHits.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-muted-foreground">Уже есть в резюме</p>
                <div className="flex flex-wrap gap-1.5">
                  {match.keywordHits.map((k) => (
                    <Badge key={k} variant="secondary">
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {match.keywordMisses.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-muted-foreground">В резюме не найдено</p>
                <div className="flex flex-wrap gap-1.5">
                  {match.keywordMisses.map((k) => (
                    <Badge key={k} variant="outline">
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {ORDER.map((coverage) => {
        const rows = match.requirements.filter((r) => r.coverage === coverage)
        if (rows.length === 0) return null
        return (
          <Card key={coverage}>
            <CardHeader>
              <CardTitle className="text-base">
                {COVERAGE_LABEL[coverage]}
                <span className="ml-2 text-sm font-normal text-muted-foreground">{rows.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {rows.map((row, i) => (
                <div key={`${coverage}-${i}`} className="rounded-md border p-3">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{row.requirement}</p>
                    <Badge variant="secondary" className={cn("border-none", COVERAGE_STYLE[coverage])}>
                      {COVERAGE_LABEL[coverage]}
                    </Badge>
                  </div>
                  {row.resumeQuote ? (
                    <p className="text-sm text-muted-foreground">«{row.resumeQuote}»</p>
                  ) : null}
                  <p className="mt-1 text-sm text-muted-foreground">{row.comment}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
