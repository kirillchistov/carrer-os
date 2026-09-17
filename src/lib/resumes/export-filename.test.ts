import { describe, expect, it } from "vitest"
import { resumeExportStem } from "./export-filename"

describe("resumeExportStem", () => {
  it("uses role and company", () => {
    expect(
      resumeExportStem({
        name: "Загруженное резюме (черновик)",
        opportunityTitle: "COO",
        companyName: "Acme",
      })
    ).toBe("COO — Acme")
  })

  it("falls back from a draft name", () => {
    expect(resumeExportStem({ name: "Загруженное резюме (черновик)" })).toBe("Резюме")
  })
})
