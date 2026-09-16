import { describe, expect, it } from "vitest"
import { sanitizeResumeProposals } from "./sanitize-proposals"
import type { ProposedChange } from "@/lib/validation/resume-proposal"

function change(overrides: Partial<ProposedChange> = {}): ProposedChange {
  return {
    section: "summary",
    changeType: "rewrite",
    originalText: "old",
    proposedText: "new",
    rationale: "x",
    evidenceIds: [],
    ...overrides,
  }
}

describe("sanitizeResumeProposals", () => {
  it("keeps a proposal targeting a valid top-level section", () => {
    const result = sanitizeResumeProposals([change({ section: "skills" })], new Set())
    expect(result).toHaveLength(1)
  })

  it("keeps a proposal targeting a valid indexed experience section", () => {
    const result = sanitizeResumeProposals([change({ section: "experience.2" })], new Set())
    expect(result).toHaveLength(1)
  })

  it("drops a proposal targeting a hallucinated section name", () => {
    const result = sanitizeResumeProposals([change({ section: "education" })], new Set())
    expect(result).toHaveLength(0)
  })

  it("drops a proposal with a malformed experience index", () => {
    const result = sanitizeResumeProposals([change({ section: "experience.abc" })], new Set())
    expect(result).toHaveLength(0)
  })

  it("strips evidence ids not in the allowed set while keeping the proposal", () => {
    const result = sanitizeResumeProposals(
      [change({ evidenceIds: ["real", "hallucinated"] })],
      new Set(["real"])
    )
    expect(result).toHaveLength(1)
    expect(result[0].evidenceIds).toEqual(["real"])
  })
})
