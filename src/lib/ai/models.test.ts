import { describe, expect, it } from "vitest"
import { modelForAiRunType } from "./models"

describe("modelForAiRunType", () => {
  it("uses the quality model for the final resume and letter", () => {
    expect(modelForAiRunType("resume_proposal")).toContain("opus")
    expect(modelForAiRunType("outreach_draft")).toContain("opus")
  })

  it("uses the faster model for extract and match", () => {
    expect(modelForAiRunType("experience_extraction")).toContain("sonnet")
    expect(modelForAiRunType("fit_assessment")).toContain("sonnet")
    expect(modelForAiRunType("opportunity_parse")).toContain("sonnet")
  })
})
