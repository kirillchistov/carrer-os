import { Badge } from "@/components/ui/badge"
import { cn } from "cn"
import { FIT_DIMENSION_LABELS, FIT_STATUS_LABELS, type FitDimensionResult } from "@/lib/validation/fit-assessment"

const STATUS_STYLES: Record<string, string> = {
  strong: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  partial: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  gap: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  unknown: "bg-muted text-muted-foreground",
}

export function FitDimensionCard({
  result,
  evidenceTitles,
  requirementTexts,
}: {
  result: FitDimensionResult
  evidenceTitles: Map<string, string>
  requirementTexts: Map<string, string>
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{FIT_DIMENSION_LABELS[result.dimension]}</p>
        <Badge variant="secondary" className={cn("border-none", STATUS_STYLES[result.status])}>
          {FIT_STATUS_LABELS[result.status]}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{result.summary}</p>
      {result.evidenceIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {result.evidenceIds.map((id) => (
            <Badge key={id} variant="outline" className="text-xs">
              {evidenceTitles.get(id) ?? id}
            </Badge>
          ))}
        </div>
      )}
      {result.requirementIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {result.requirementIds.map((id) => (
            <Badge key={id} variant="outline" className="text-xs text-muted-foreground">
              {requirementTexts.get(id) ?? id}
            </Badge>
          ))}
        </div>
      )}
      {result.recommendedAction && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Действие: </span>
          {result.recommendedAction}
        </p>
      )}
    </div>
  )
}
