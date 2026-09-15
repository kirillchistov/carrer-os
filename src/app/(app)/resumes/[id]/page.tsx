import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getResume } from "@/lib/actions/resumes"
import { NotFoundError } from "@/lib/errors"
import { ResumeEditor } from "@/components/resumes/resume-editor"
import { ResumeTitleEditor } from "@/components/resumes/resume-title-editor"

export default async function ResumeEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let data: Awaited<ReturnType<typeof getResume>>
  try {
    data = await getResume(id)
  } catch (error) {
    if (error instanceof NotFoundError) notFound()
    throw error
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/resumes" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" />
          Resumes
        </Link>
        <ResumeTitleEditor resumeId={data.resume.id} initialName={data.resume.name} />
      </div>
      <ResumeEditor resumeId={data.resume.id} initialContent={data.content} />
    </div>
  )
}
