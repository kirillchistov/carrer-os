import { describe, expect, it } from "vitest"
import { applyProposal } from "./apply-proposal"
import { emptyResumeContent, type ResumeContent } from "@/lib/validation/resume"

function content(overrides: Partial<ResumeContent> = {}): ResumeContent {
  return { ...emptyResumeContent, ...overrides }
}

describe("applyProposal", () => {
  it("replaces the summary wholesale on a summary rewrite", () => {
    const result = applyProposal(content({ summary: "old" }), {
      section: "summary",
      changeType: "rewrite",
      originalText: "old",
      proposedText: "new",
    })
    expect(result.summary).toBe("new")
  })

  it("adds a new skill", () => {
    const result = applyProposal(content({ skills: ["A"] }), {
      section: "skills",
      changeType: "add",
      originalText: null,
      proposedText: "B",
    })
    expect(result.skills).toEqual(["A", "B"])
  })

  it("removes a skill that matches originalText exactly", () => {
    const result = applyProposal(content({ skills: ["A", "B"] }), {
      section: "skills",
      changeType: "remove",
      originalText: "A",
      proposedText: "",
    })
    expect(result.skills).toEqual(["B"])
  })

  it("rewrites a skill in place, preserving position", () => {
    const result = applyProposal(content({ skills: ["A", "B", "C"] }), {
      section: "skills",
      changeType: "rewrite",
      originalText: "B",
      proposedText: "B2",
    })
    expect(result.skills).toEqual(["A", "B2", "C"])
  })

  it("appends instead of failing when a rewrite's originalText isn't found", () => {
    const result = applyProposal(content({ skills: ["A"] }), {
      section: "skills",
      changeType: "rewrite",
      originalText: "does-not-exist",
      proposedText: "B",
    })
    expect(result.skills).toEqual(["A", "B"])
  })

  it("adds an achievement", () => {
    const result = applyProposal(content(), {
      section: "achievements",
      changeType: "add",
      originalText: null,
      proposedText: "Grew revenue 20%",
    })
    expect(result.achievements).toEqual(["Grew revenue 20%"])
  })

  it("rewrites a bullet within a specific experience entry addressed by index", () => {
    const base = content({
      experience: [
        { title: "CEO", company: "Acme", period: "2020-2022", bullets: ["Led team", "Grew revenue"] },
        { title: "CTO", company: "Beta", period: "2018-2020", bullets: ["Shipped product"] },
      ],
    })
    const result = applyProposal(base, {
      section: "experience.0",
      changeType: "rewrite",
      originalText: "Led team",
      proposedText: "Led a team of 12",
    })
    expect(result.experience[0].bullets).toEqual(["Led a team of 12", "Grew revenue"])
    expect(result.experience[1].bullets).toEqual(["Shipped product"])
  })

  it("adds a bullet to a specific experience entry without touching others", () => {
    const base = content({
      experience: [
        { title: "CEO", company: "Acme", period: "2020-2022", bullets: ["Led team"] },
      ],
    })
    const result = applyProposal(base, {
      section: "experience.0",
      changeType: "add",
      originalText: null,
      proposedText: "Closed $2M in new business",
    })
    expect(result.experience[0].bullets).toEqual(["Led team", "Closed $2M in new business"])
  })

  it("is a no-op when the experience index is out of range", () => {
    const base = content({ experience: [] })
    const result = applyProposal(base, {
      section: "experience.5",
      changeType: "add",
      originalText: null,
      proposedText: "x",
    })
    expect(result).toEqual(base)
  })

  it("is a no-op for an unrecognized section rather than throwing", () => {
    const base = content()
    const result = applyProposal(base, {
      section: "not_a_real_section",
      changeType: "add",
      originalText: null,
      proposedText: "x",
    })
    expect(result).toEqual(base)
  })

  it("does not mutate the input content", () => {
    const base = content({ skills: ["A"] })
    applyProposal(base, { section: "skills", changeType: "add", originalText: null, proposedText: "B" })
    expect(base.skills).toEqual(["A"])
  })
})
