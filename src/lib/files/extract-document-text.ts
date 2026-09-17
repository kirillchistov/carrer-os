export function isDocxFile(file: { type: string; name: string }): boolean {
  return (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx")
  )
}

export function isPdfFile(file: { type: string; name: string }): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
}

export async function extractDocxText(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth")
  const extraction = await mammoth.extractRawText({ buffer })
  return extraction.value.trim()
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf")
  const pdf = await getDocumentProxy(new Uint8Array(buffer))
  const result = await extractText(pdf, { mergePages: true })
  const text = Array.isArray(result.text) ? result.text.join("\n") : result.text
  return text.replace(/\u0000/g, "").trim()
}
