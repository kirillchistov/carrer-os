import { FIT_DIMENSION_ORDER } from "@/lib/validation/fit-assessment"
import type { FitAssessmentResult, FitDimensionResult } from "@/lib/validation/fit-assessment"

/**
 * Defensive post-processing of the model's output before it's ever persisted: drops any
 * evidence/requirement id the model cited that wasn't actually in the set we gave it
 * (never trust a citation blindly — see docs/product-plan.md §12), and fills in any of
 * the 10 dimensions the model omitted with an explicit "unknown" rather than silently
 * dropping it.
 */
export function sanitizeFitAssessmentResult(
  result: FitAssessmentResult,
  allowedEvidenceIds: Set<string>,
  allowedRequirementIds: Set<string>
): FitAssessmentResult {
  const byDimension = new Map<string, FitDimensionResult>()
  for (const dim of result.dimensions) {
    byDimension.set(dim.dimension, {
      ...dim,
      evidenceIds: dim.evidenceIds.filter((id) => allowedEvidenceIds.has(id)),
      requirementIds: dim.requirementIds.filter((id) => allowedRequirementIds.has(id)),
    })
  }

  const dimensions: FitDimensionResult[] = FIT_DIMENSION_ORDER.map((dimension) => {
    const existing = byDimension.get(dimension)
    if (existing) return existing
    return {
      dimension,
      status: "unknown",
      summary: "Модель не вернула данные по этому измерению — требуется уточнение.",
      evidenceIds: [],
      requirementIds: [],
      recommendedAction: null,
    }
  })

  return {
    ...result,
    dimensions,
    evidenceToEmphasize: result.evidenceToEmphasize.filter((id) => allowedEvidenceIds.has(id)),
  }
}
