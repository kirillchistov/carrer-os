import { describe, expect, it } from "vitest"
import { sanitizeFitAssessmentResult } from "./sanitize-result"
import type { FitAssessmentResult } from "@/lib/validation/fit-assessment"
import { FIT_DIMENSION_ORDER } from "@/lib/validation/fit-assessment"

function fullResult(overrides: Partial<FitAssessmentResult> = {}): FitAssessmentResult {
  return {
    overallLabel: "partial_fit",
    overallScore: 60,
    dimensions: FIT_DIMENSION_ORDER.map((dimension) => ({
      dimension,
      status: "unknown" as const,
      summary: "x",
      evidenceIds: [],
      requirementIds: [],
      recommendedAction: null,
    })),
    whyYouFit: "x",
    evidenceToEmphasize: [],
    gapsAndRisks: [],
    questionsToValidate: [],
    resumeChangesRecommended: [],
    outreachAngle: "x",
    nextBestAction: "x",
    ...overrides,
  }
}

describe("sanitizeFitAssessmentResult", () => {
  it("strips an evidence id the model cited that was never given to it", () => {
    const result = fullResult({
      dimensions: FIT_DIMENSION_ORDER.map((dimension, i) => ({
        dimension,
        status: "strong" as const,
        summary: "x",
        evidenceIds: i === 0 ? ["ev_real", "ev_hallucinated"] : [],
        requirementIds: [],
        recommendedAction: null,
      })),
    })

    const sanitized = sanitizeFitAssessmentResult(result, new Set(["ev_real"]), new Set())
    expect(sanitized.dimensions[0].evidenceIds).toEqual(["ev_real"])
  })

  it("strips a requirement id the model cited that was never given to it", () => {
    const result = fullResult({
      dimensions: FIT_DIMENSION_ORDER.map((dimension, i) => ({
        dimension,
        status: "strong" as const,
        summary: "x",
        evidenceIds: [],
        requirementIds: i === 0 ? ["req_real", "req_hallucinated"] : [],
        recommendedAction: null,
      })),
    })

    const sanitized = sanitizeFitAssessmentResult(result, new Set(), new Set(["req_real"]))
    expect(sanitized.dimensions[0].requirementIds).toEqual(["req_real"])
  })

  it("fills in a missing dimension as unknown instead of dropping it", () => {
    const result = fullResult({
      dimensions: FIT_DIMENSION_ORDER.filter((d) => d !== "freshness_fit").map((dimension) => ({
        dimension,
        status: "strong" as const,
        summary: "x",
        evidenceIds: [],
        requirementIds: [],
        recommendedAction: null,
      })),
    })

    const sanitized = sanitizeFitAssessmentResult(result, new Set(), new Set())
    expect(sanitized.dimensions).toHaveLength(10)
    const freshness = sanitized.dimensions.find((d) => d.dimension === "freshness_fit")
    expect(freshness?.status).toBe("unknown")
  })

  it("always returns dimensions in the canonical order regardless of model output order", () => {
    const shuffled = [...FIT_DIMENSION_ORDER].reverse()
    const result = fullResult({
      dimensions: shuffled.map((dimension) => ({
        dimension,
        status: "strong" as const,
        summary: "x",
        evidenceIds: [],
        requirementIds: [],
        recommendedAction: null,
      })),
    })

    const sanitized = sanitizeFitAssessmentResult(result, new Set(), new Set())
    expect(sanitized.dimensions.map((d) => d.dimension)).toEqual(FIT_DIMENSION_ORDER)
  })

  it("strips hallucinated ids from the top-level evidenceToEmphasize list", () => {
    const result = fullResult({ evidenceToEmphasize: ["ev_real", "ev_fake"] })
    const sanitized = sanitizeFitAssessmentResult(result, new Set(["ev_real"]), new Set())
    expect(sanitized.evidenceToEmphasize).toEqual(["ev_real"])
  })
})
