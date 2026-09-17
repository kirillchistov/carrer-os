import { describe, expect, it } from "vitest"
import { buildQuickTailorGeneratePrompt, buildQuickTailorMatchPrompt } from "./prompts"

describe("quick tailor prompts", () => {
  it("includes resume and vacancy text for the match step", () => {
    const prompt = buildQuickTailorMatchPrompt("Led a team of 8", {
      title: "COO",
      companyName: "Acme",
      text: "Must have P&L ownership",
    })
    expect(prompt).toContain("Led a team of 8")
    expect(prompt).toContain("COO — Acme")
    expect(prompt).toContain("Must have P&L ownership")
  })

  it("omits empty clarifying answers from the generate prompt", () => {
    const prompt = buildQuickTailorGeneratePrompt({
      resumeText: "Resume body",
      job: { title: "CMO", companyName: "Beta", text: "Growth" },
      answers: [
        { id: "q1", prompt: "What metric?", answer: "  " },
        { id: "q2", prompt: "Team size?", answer: "12 people" },
      ],
    })
    expect(prompt).toContain("Resume body")
    expect(prompt).toContain("12 people")
    expect(prompt).not.toContain("What metric?")
  })

  it("states that there are no answers when all are blank", () => {
    const prompt = buildQuickTailorGeneratePrompt({
      resumeText: "Resume",
      job: { title: "Role", companyName: "Co", text: "Job" },
      answers: [{ id: "q1", prompt: "Anything?", answer: "" }],
    })
    expect(prompt).toContain("(none — work only from the resume text)")
  })
})
