import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
import { getResume } from "@/lib/actions/resumes"
import { NotFoundError } from "@/lib/errors"
import { prisma } from "@/lib/db/prisma"
import { requireCurrentUser } from "@/lib/auth/session"
import { ResumeEditor } from "@/components/resumes/resume-editor"
import { ResumeTitleEditor } from "@/components/resumes/resume-title-editor"
import { TailorForOpportunityDialog } from "@/components/resumes/tailor-for-opportunity-dialog"
import { Button } from "@/components/ui/button"

export default async function ResumeEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireCurrentUser()

  let data: Awaited<ReturnType<typeof getResume>>
  try {
    data = await getResume(id)
  } catch (error) {
    if (error instanceof NotFoundError) notFound()
    throw error
  }

  const opportunities = await prisma.opportunity.findMany({
    where: { userId: user.id },
    select: { id: true, title: true, companyName: true },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/resumes" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" />
            Resumes
          </Link>
          <ResumeTitleEditor resumeId={data.resume.id} initialName={data.resume.name} />
        </div>
        <div className="flex shrink-0 gap-2 pt-1">
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={`/api/resumes/${id}/export`} />}
          >
            <Download className="size-4" />
            Скачать .docx
          </Button>
          <TailorForOpportunityDialog
            resumeId={id}
            opportunities={opportunities.map((o) => ({ id: o.id, label: `${o.title} — ${o.companyName}` }))}
          />
        </div>
      </div>
      <ResumeEditor resumeId={data.resume.id} initialContent={data.content} />
    </div>
  )
}
