import "server-only"
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx"
import type { ResumeContent } from "@/lib/validation/resume"

function heading(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 } })
}

function bullet(text: string) {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 60 } })
}

export async function buildResumeDocx(name: string, content: ResumeContent): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({
      text: name,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    }),
  ]

  if (content.summary) {
    children.push(heading("Summary"), new Paragraph({ text: content.summary, spacing: { after: 120 } }))
  }

  if (content.experience.length > 0) {
    children.push(heading("Experience"))
    for (const entry of content.experience) {
      children.push(
        new Paragraph({
          spacing: { before: 160, after: 40 },
          children: [
            new TextRun({ text: `${entry.title} — ${entry.company}`, bold: true }),
            new TextRun({ text: `  ${entry.period}`, italics: true }),
          ],
        })
      )
      for (const b of entry.bullets) children.push(bullet(b))
    }
  }

  if (content.achievements.length > 0) {
    children.push(heading("Achievements"))
    for (const a of content.achievements) children.push(bullet(a))
  }

  if (content.skills.length > 0) {
    children.push(heading("Skills"), new Paragraph({ text: content.skills.join(", ") }))
  }

  if (content.education.length > 0) {
    children.push(heading("Education"))
    for (const edu of content.education) {
      children.push(new Paragraph({ text: `${edu.degree}, ${edu.institution} (${edu.year})` }))
    }
  }

  if (content.certifications.length > 0) {
    children.push(heading("Certifications"))
    for (const c of content.certifications) children.push(bullet(c))
  }

  if (content.projects.length > 0) {
    children.push(heading("Projects"))
    for (const p of content.projects) children.push(bullet(p))
  }

  const doc = new Document({ sections: [{ children }] })
  return Packer.toBuffer(doc)
}
