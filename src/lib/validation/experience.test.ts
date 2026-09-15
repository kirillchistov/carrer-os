import { describe, expect, it } from "vitest"
import { experienceExtractionResultSchema, parseFlexibleDate } from "./experience"

describe("experienceExtractionResultSchema", () => {
  it("accepts a well-formed extraction result", () => {
    const result = experienceExtractionResultSchema.safeParse({
      experiences: [
        {
          companyName: "Ритейл Групп",
          companyIndustry: "retail",
          title: "Коммерческий директор",
          employmentType: "permanent",
          startDate: "2019-03",
          endDate: null,
          isCurrent: true,
          location: "Москва",
          description: "Отвечала за коммерческий блок",
          responsibilities: ["P&L", "Управление командой"],
          teamSize: 45,
          budgetDescription: "180 млн ₽",
        },
      ],
      notes: null,
    })
    expect(result.success).toBe(true)
  })

  it("accepts an empty experiences array with an explanatory note", () => {
    const result = experienceExtractionResultSchema.safeParse({
      experiences: [],
      notes: "Текст не содержит описания опыта работы.",
    })
    expect(result.success).toBe(true)
  })

  it("rejects an entry missing the required companyName field", () => {
    const result = experienceExtractionResultSchema.safeParse({
      experiences: [{ title: "CEO", isCurrent: false, responsibilities: [] }],
      notes: null,
    })
    expect(result.success).toBe(false)
  })

  it("rejects an invalid employmentType enum value (guards against a hallucinated category)", () => {
    const result = experienceExtractionResultSchema.safeParse({
      experiences: [
        {
          companyName: "X",
          companyIndustry: null,
          title: "Y",
          employmentType: "freelance-ish", // not a real enum value
          startDate: null,
          endDate: null,
          isCurrent: false,
          location: null,
          description: null,
          responsibilities: [],
          teamSize: null,
          budgetDescription: null,
        },
      ],
      notes: null,
    })
    expect(result.success).toBe(false)
  })
})

describe("parseFlexibleDate", () => {
  it("parses a full YYYY-MM-DD date", () => {
    const date = parseFlexibleDate("2020-06-15")
    expect(date?.toISOString().slice(0, 10)).toBe("2020-06-15")
  })

  it("parses a YYYY-MM date, defaulting the day to the 1st", () => {
    const date = parseFlexibleDate("2020-06")
    expect(date?.toISOString().slice(0, 10)).toBe("2020-06-01")
  })

  it("parses a bare year, defaulting month and day", () => {
    const date = parseFlexibleDate("2020")
    expect(date?.toISOString().slice(0, 10)).toBe("2020-01-01")
  })

  it("returns null for null, undefined, and unparseable input", () => {
    expect(parseFlexibleDate(null)).toBeNull()
    expect(parseFlexibleDate(undefined)).toBeNull()
    expect(parseFlexibleDate("unclear")).toBeNull()
    expect(parseFlexibleDate("настоящее время")).toBeNull()
  })
})
