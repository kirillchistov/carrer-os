import { describe, expect, it } from "vitest"
import { creditLabel, summarizeMatch } from "./summary"
import { quickTailorMatchSchema, quickTailorResultSchema } from "@/lib/validation/quick-tailor"

describe("summarizeMatch", () => {
  it("counts coverage buckets", () => {
    const match = quickTailorMatchSchema.parse({
      title: "COO",
      companyName: "Acme",
      summary: "Strong ops overlap, gap on SAP.",
      keywordHits: ["P&L"],
      keywordMisses: ["SAP"],
      questions: [],
      requirements: [
        {
          requirement: "P&L",
          category: "responsibility",
          importance: "must_have",
          coverage: "full",
          resumeQuote: "Managed P&L 2B",
          comment: "Direct match",
        },
        {
          requirement: "Team",
          category: "responsibility",
          importance: "must_have",
          coverage: "partial",
          resumeQuote: "Led a team",
          comment: "No size",
        },
        {
          requirement: "SAP",
          category: "tool",
          importance: "nice_to_have",
          coverage: "missing",
          resumeQuote: null,
          comment: "Not mentioned",
        },
      ],
    })
    expect(summarizeMatch(match)).toEqual({ full: 1, partial: 1, missing: 1, total: 3 })
  })
})

describe("creditLabel", () => {
  it("uses Russian plural forms", () => {
    expect(creditLabel(1)).toBe("1 кредит")
    expect(creditLabel(2)).toBe("2 кредита")
    expect(creditLabel(5)).toBe("5 кредитов")
    expect(creditLabel(21)).toBe("21 кредит")
  })
})

describe("quickTailorResultSchema", () => {
  it("rejects a dump-only resume without structured experience when empty arrays are ok but keyChanges must be objects", () => {
    const parsed = quickTailorResultSchema.safeParse({
      resume: {
        summary: "raw dump",
        experience: [],
        achievements: [],
        skills: [],
        education: [],
        certifications: [],
        projects: [],
      },
      keyChanges: ["moved bullets"],
      coverLetter: "Hello",
    })
    expect(parsed.success).toBe(false)
  })

  it("accepts structured key changes", () => {
    const parsed = quickTailorResultSchema.safeParse({
      resume: {
        summary: "Ops leader",
        experience: [{ title: "COO", company: "Acme", period: "2020—2024", bullets: ["Cut costs 12%"] }],
        achievements: [],
        skills: ["P&L"],
        education: [],
        certifications: [],
        projects: [],
      },
      keyChanges: [{ change: "Raised P&L bullet", requirement: "P&L ownership" }],
      coverLetter: "Letter",
    })
    expect(parsed.success).toBe(true)
  })
})
