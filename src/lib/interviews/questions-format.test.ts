import { describe, it, expect } from "vitest"
import { questionsToJson, questionsFromJson } from "./questions-format"

describe("questionsToJson", () => {
  it("splits non-empty lines and trims whitespace", () => {
    expect(questionsToJson("Question one\n  Question two  \n\nQuestion three")).toEqual([
      "Question one",
      "Question two",
      "Question three",
    ])
  })

  it("returns an empty array for null or blank input", () => {
    expect(questionsToJson(null)).toEqual([])
    expect(questionsToJson("   \n  \n")).toEqual([])
  })
})

describe("questionsFromJson", () => {
  it("joins a string array back into newline-separated text", () => {
    expect(questionsFromJson(["Q1", "Q2"])).toBe("Q1\nQ2")
  })

  it("returns null for non-array values", () => {
    expect(questionsFromJson(null)).toBeNull()
    expect(questionsFromJson("not an array")).toBeNull()
    expect(questionsFromJson(undefined)).toBeNull()
  })

  it("round-trips through questionsToJson", () => {
    const original = "First question\nSecond question"
    expect(questionsFromJson(questionsToJson(original))).toBe(original)
  })
})
