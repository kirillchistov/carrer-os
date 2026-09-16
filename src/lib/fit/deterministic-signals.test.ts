import { describe, expect, it } from "vitest"
import { computeDeterministicSignals, type DeterministicSignalsInput } from "./deterministic-signals"

function baseInput(overrides: Partial<DeterministicSignalsInput> = {}): DeterministicSignalsInput {
  return {
    opportunity: { employmentFormat: "permanent", workMode: "hybrid", location: "Москва" },
    requirements: [],
    careerTrack: { employmentFormats: ["permanent"], targetIndustries: ["retail"] },
    profile: { targetWorkModes: ["hybrid", "remote"], targetLocations: ["Москва"] },
    skillNames: [],
    evidence: [],
    ...overrides,
  }
}

describe("computeDeterministicSignals", () => {
  it("matches employment format when the opportunity's format is in the track's list", () => {
    const result = computeDeterministicSignals(baseInput())
    expect(result.employmentFormatMatch).toBe(true)
  })

  it("flags a mismatched employment format", () => {
    const result = computeDeterministicSignals(
      baseInput({ opportunity: { employmentFormat: "contract", workMode: null, location: null } })
    )
    expect(result.employmentFormatMatch).toBe(false)
  })

  it("returns null for employment format when the opportunity doesn't state one", () => {
    const result = computeDeterministicSignals(
      baseInput({ opportunity: { employmentFormat: null, workMode: null, location: null } })
    )
    expect(result.employmentFormatMatch).toBeNull()
  })

  it("matches work mode against the candidate's stated preferences", () => {
    const result = computeDeterministicSignals(baseInput())
    expect(result.workModeMatch).toBe(true)
  })

  it("flags a work mode not in the candidate's preferences", () => {
    const result = computeDeterministicSignals(
      baseInput({ opportunity: { employmentFormat: null, workMode: "onsite", location: null } })
    )
    expect(result.workModeMatch).toBe(false)
  })

  it("returns null for location/work-mode when there is no profile", () => {
    const result = computeDeterministicSignals(baseInput({ profile: null }))
    expect(result.workModeMatch).toBeNull()
    expect(result.locationMatch).toBeNull()
  })

  it("matches location with a case-insensitive fuzzy comparison", () => {
    const result = computeDeterministicSignals(
      baseInput({
        opportunity: { employmentFormat: null, workMode: null, location: "москва, гибрид" },
        profile: { targetWorkModes: [], targetLocations: ["Москва"] },
      })
    )
    expect(result.locationMatch).toBe(true)
  })

  it("counts matched and missing skill requirements against the candidate's skill pool", () => {
    const result = computeDeterministicSignals(
      baseInput({
        requirements: [
          { id: "r1", category: "skill", text: "P&L management", importance: "must_have", normalizedSkill: "P&L" },
          { id: "r2", category: "tool", text: "Salesforce", importance: "nice_to_have", normalizedSkill: "Salesforce" },
        ],
        skillNames: ["P&L management"],
      })
    )
    expect(result.matchedSkillCount).toBe(1)
    expect(result.missingSkillCount).toBe(1)
    expect(result.skillMatches).toEqual([
      { requirementId: "r1", text: "P&L", matched: true },
      { requirementId: "r2", text: "Salesforce", matched: false },
    ])
  })

  it("pulls candidate skills from evidence tags as well as the Skill list", () => {
    const result = computeDeterministicSignals(
      baseInput({
        requirements: [
          { id: "r1", category: "skill", text: "Growth strategy", importance: "must_have", normalizedSkill: null },
        ],
        skillNames: [],
        evidence: [
          { id: "e1", title: "Launched growth loop", skills: ["Growth strategy"], industries: [], qualityScore: 80 },
        ],
      })
    )
    expect(result.matchedSkillCount).toBe(1)
  })

  it("ignores non-skill/tool requirements when counting skill matches", () => {
    const result = computeDeterministicSignals(
      baseInput({
        requirements: [
          { id: "r1", category: "responsibility", text: "Manage a team", importance: "must_have", normalizedSkill: null },
        ],
      })
    )
    expect(result.skillMatches).toHaveLength(0)
  })

  it("computes industry overlap from industry_experience requirements vs. the track's target industries", () => {
    const overlapping = computeDeterministicSignals(
      baseInput({
        requirements: [
          { id: "r1", category: "industry_experience", text: "Retail background", importance: "must_have", normalizedSkill: "retail" },
        ],
      })
    )
    expect(overlapping.industryOverlap).toBe(true)

    const notOverlapping = computeDeterministicSignals(
      baseInput({
        requirements: [
          { id: "r1", category: "industry_experience", text: "Fintech background", importance: "must_have", normalizedSkill: "fintech" },
        ],
      })
    )
    expect(notOverlapping.industryOverlap).toBe(false)
  })

  it("returns null industry overlap when the opportunity states no industry requirement", () => {
    const result = computeDeterministicSignals(baseInput())
    expect(result.industryOverlap).toBeNull()
  })

  it("averages evidence quality scores and ignores nulls", () => {
    const result = computeDeterministicSignals(
      baseInput({
        evidence: [
          { id: "e1", title: "A", skills: [], industries: [], qualityScore: 80 },
          { id: "e2", title: "B", skills: [], industries: [], qualityScore: 60 },
          { id: "e3", title: "C", skills: [], industries: [], qualityScore: null },
        ],
      })
    )
    expect(result.evidenceCountForTrack).toBe(3)
    expect(result.averageEvidenceQuality).toBe(70)
  })

  it("returns null average quality when there is no evidence", () => {
    const result = computeDeterministicSignals(baseInput())
    expect(result.averageEvidenceQuality).toBeNull()
  })
})
