import { describe, expect, it } from "vitest"
import { computeEvidenceQualityScore } from "./quality-score"

const LONG = "x".repeat(25)

describe("computeEvidenceQualityScore", () => {
  it("scores 0 and lists everything missing when all fields are empty", () => {
    const result = computeEvidenceQualityScore({
      situation: null,
      task: null,
      action: null,
      result: null,
      metricValue: null,
    })
    expect(result.score).toBe(0)
    expect(result.explanation).toContain("ситуация")
    expect(result.explanation).toContain("метрика")
  })

  it("scores 100 with a clean explanation when every field is filled", () => {
    const result = computeEvidenceQualityScore({
      situation: LONG,
      task: LONG,
      action: LONG,
      result: LONG,
      metricValue: 42,
    })
    expect(result.score).toBe(100)
    expect(result.explanation).not.toContain("Не хватает")
  })

  it("does not count a field as present when it is too short to be meaningful", () => {
    const result = computeEvidenceQualityScore({
      situation: "ok",
      task: LONG,
      action: LONG,
      result: LONG,
      metricValue: 1,
    })
    expect(result.score).toBe(80)
    expect(result.explanation).toContain("ситуация")
  })

  it("weighs action and result higher than situation and task (per the CAR/STAR emphasis)", () => {
    const onlyAction = computeEvidenceQualityScore({
      situation: null,
      task: null,
      action: LONG,
      result: null,
      metricValue: null,
    })
    const onlySituation = computeEvidenceQualityScore({
      situation: LONG,
      task: null,
      action: null,
      result: null,
      metricValue: null,
    })
    expect(onlyAction.score).toBeGreaterThan(onlySituation.score)
  })

  it("credits a present evidence-of-vagueness case: a result with no metric still scores less than one with a metric", () => {
    const withMetric = computeEvidenceQualityScore({
      situation: LONG,
      task: LONG,
      action: LONG,
      result: LONG,
      metricValue: 10,
    })
    const withoutMetric = computeEvidenceQualityScore({
      situation: LONG,
      task: LONG,
      action: LONG,
      result: LONG,
      metricValue: null,
    })
    expect(withMetric.score).toBeGreaterThan(withoutMetric.score)
  })
})
