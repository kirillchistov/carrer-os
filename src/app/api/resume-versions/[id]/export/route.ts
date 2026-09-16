import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireCurrentUser } from "@/lib/auth/session"
import { assertOwned } from "@/lib/db/with-ownership"
import { resumeContentSchema, emptyResumeContent } from "@/lib/validation/resume"
import { buildResumeDocx } from "@/lib/resumes/build-docx"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireCurrentUser()
  const resumeVersion = assertOwned(await prisma.resumeVersion.findUnique({ where: { id } }), user.id)

  const parsed = resumeContentSchema.safeParse(resumeVersion.structuredContent)
  const buffer = await buildResumeDocx(resumeVersion.name, parsed.success ? parsed.data : emptyResumeContent)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${sanitizeFilename(resumeVersion.name)}.docx"`,
    },
  })
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^\p{L}\p{N}\-_. ]/gu, "_").slice(0, 100) || "resume"
}
