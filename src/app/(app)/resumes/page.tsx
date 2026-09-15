import { listMyResumes } from "@/lib/actions/resumes"
import { listCareerTrackOptions } from "@/lib/actions/evidence"
import { CreateResumeDialog } from "@/components/resumes/create-resume-dialog"
import { ResumeList } from "@/components/resumes/resume-list"

export default async function ResumesPage() {
  const [resumes, careerTracks] = await Promise.all([listMyResumes(), listCareerTrackOptions()])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Resumes</h1>
          <p className="text-sm text-muted-foreground">Базовые резюме по трекам.</p>
        </div>
        <CreateResumeDialog careerTrackOptions={careerTracks.map((t) => ({ id: t.id, label: t.title }))} />
      </div>
      <ResumeList resumes={resumes} />
    </div>
  )
}
