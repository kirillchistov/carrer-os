import { describe, expect, it } from "vitest"
import { isDocxFile, isPdfFile } from "./extract-document-text"

describe("resume file type detection", () => {
  it("recognizes docx by mime and extension", () => {
    expect(
      isDocxFile({
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        name: "cv",
      })
    ).toBe(true)
    expect(isDocxFile({ type: "", name: "Resume.DOCX" })).toBe(true)
    expect(isDocxFile({ type: "application/pdf", name: "cv.pdf" })).toBe(false)
  })

  it("recognizes pdf by mime and extension", () => {
    expect(isPdfFile({ type: "application/pdf", name: "cv" })).toBe(true)
    expect(isPdfFile({ type: "", name: "scan.PDF" })).toBe(true)
    expect(isPdfFile({ type: "", name: "cv.docx" })).toBe(false)
  })
})
