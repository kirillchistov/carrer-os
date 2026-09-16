import "server-only"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib"
import fontkit from "@pdf-lib/fontkit"
import type { ResumeContent } from "@/lib/validation/resume"

const PAGE_WIDTH = 595.28 // A4 at 72dpi
const PAGE_HEIGHT = 841.89
const MARGIN = 56
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

const TITLE_SIZE = 20
const HEADING_SIZE = 13
const BODY_SIZE = 10.5
const LINE_GAP = 4

/**
 * Best-effort PDF export: manual text layout since pdf-lib has no flow/reflow engine.
 * Uses PT Sans (embedded via fontkit) rather than a standard PDF font because the
 * standard 14 fonts only cover WinAnsi and can't render Cyrillic, which most resume
 * content here is written in.
 */
class PdfWriter {
  private doc: PDFDocument
  private regular: PDFFont
  private bold: PDFFont
  private page: PDFPage
  private y: number

  private constructor(doc: PDFDocument, regular: PDFFont, bold: PDFFont) {
    this.doc = doc
    this.regular = regular
    this.bold = bold
    this.page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    this.y = PAGE_HEIGHT - MARGIN
  }

  static async create(): Promise<PdfWriter> {
    const doc = await PDFDocument.create()
    doc.registerFontkit(fontkit)
    const [regularBytes, boldBytes] = await Promise.all([
      readFile(path.join(process.cwd(), "public/fonts/PTSans-Regular.ttf")),
      readFile(path.join(process.cwd(), "public/fonts/PTSans-Bold.ttf")),
    ])
    const regular = await doc.embedFont(regularBytes, { subset: true })
    const bold = await doc.embedFont(boldBytes, { subset: true })
    return new PdfWriter(doc, regular, bold)
  }

  private ensureSpace(height: number) {
    if (this.y - height < MARGIN) {
      this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      this.y = PAGE_HEIGHT - MARGIN
    }
  }

  private wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
    const words = text.split(/\s+/).filter(Boolean)
    const lines: string[] = []
    let current = ""
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
        lines.push(current)
        current = word
      } else {
        current = candidate
      }
    }
    if (current) lines.push(current)
    return lines.length > 0 ? lines : [""]
  }

  private writeLines(text: string, font: PDFFont, size: number, indent = 0) {
    const lines = this.wrap(text, font, size, CONTENT_WIDTH - indent)
    for (const line of lines) {
      this.ensureSpace(size + LINE_GAP)
      this.page.drawText(line, { x: MARGIN + indent, y: this.y - size, size, font, color: rgb(0.1, 0.1, 0.12) })
      this.y -= size + LINE_GAP
    }
  }

  title(text: string) {
    this.ensureSpace(TITLE_SIZE + 12)
    this.page.drawText(text, { x: MARGIN, y: this.y - TITLE_SIZE, size: TITLE_SIZE, font: this.bold, color: rgb(0, 0, 0) })
    this.y -= TITLE_SIZE + 16
  }

  heading(text: string) {
    this.ensureSpace(HEADING_SIZE + 14)
    this.y -= 6
    this.page.drawText(text, { x: MARGIN, y: this.y - HEADING_SIZE, size: HEADING_SIZE, font: this.bold, color: rgb(0.15, 0.15, 0.4) })
    this.y -= HEADING_SIZE + 8
  }

  paragraph(text: string) {
    this.writeLines(text, this.regular, BODY_SIZE)
    this.y -= 4
  }

  bullet(text: string) {
    this.ensureSpace(BODY_SIZE + LINE_GAP)
    this.page.drawText("•", { x: MARGIN, y: this.y - BODY_SIZE, size: BODY_SIZE, font: this.regular, color: rgb(0.1, 0.1, 0.12) })
    this.writeLines(text, this.regular, BODY_SIZE, 14)
  }

  boldLine(text: string) {
    this.writeLines(text, this.bold, BODY_SIZE)
  }

  async toBytes(): Promise<Uint8Array> {
    return this.doc.save()
  }
}

export async function buildResumePdf(name: string, content: ResumeContent): Promise<Uint8Array> {
  const writer = await PdfWriter.create()
  writer.title(name)

  if (content.summary) {
    writer.heading("Summary")
    writer.paragraph(content.summary)
  }

  if (content.experience.length > 0) {
    writer.heading("Experience")
    for (const entry of content.experience) {
      writer.boldLine(`${entry.title} — ${entry.company}  (${entry.period})`)
      for (const b of entry.bullets) writer.bullet(b)
    }
  }

  if (content.achievements.length > 0) {
    writer.heading("Achievements")
    for (const a of content.achievements) writer.bullet(a)
  }

  if (content.skills.length > 0) {
    writer.heading("Skills")
    writer.paragraph(content.skills.join(", "))
  }

  if (content.education.length > 0) {
    writer.heading("Education")
    for (const edu of content.education) writer.paragraph(`${edu.degree}, ${edu.institution} (${edu.year})`)
  }

  if (content.certifications.length > 0) {
    writer.heading("Certifications")
    for (const c of content.certifications) writer.bullet(c)
  }

  if (content.projects.length > 0) {
    writer.heading("Projects")
    for (const p of content.projects) writer.bullet(p)
  }

  return writer.toBytes()
}
