import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireCurrentUser } from "@/lib/auth/session"
import { assertOwned } from "@/lib/db/with-ownership"
import { resumeContentSchema, emptyResumeContent } from "@/lib/validation/resume"
import { buildResumeDocx } from "@/lib/resumes/build-docx"
import { buildResumePdf } from "@/lib/resumes/build-pdf"
import { track } from "@/lib/analytics/track"
import { contentDispositionAttachment } from "@/lib/http/content-disposition"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireCurrentUser()
  const resume = assertOwned(await prisma.resume.findUnique({ where: { id } }), user.id)

  const format = new URL(request.url).searchParams.get("format") === "pdf" ? "pdf" : "docx"
  const parsed = resumeContentSchema.safeParse(resume.structuredContent)
  const content = parsed.success ? parsed.data : emptyResumeContent

  track("resume_exported", user.id, { resumeId: resume.id, format })

  if (format === "pdf") {
    const bytes = await buildResumePdf(resume.name, content)
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDispositionAttachment(resume.name, "pdf"),
      },
    })
  }

  const buffer = await buildResumeDocx(resume.name, content)
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": contentDispositionAttachment(resume.name, "docx"),
    },
  })
}
