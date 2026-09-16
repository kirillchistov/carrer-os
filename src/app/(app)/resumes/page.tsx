import { listMyResumes } from "@/lib/actions/resumes"
import { listCareerTrackOptions } from "@/lib/actions/evidence"
import { listQuickTailorResults } from "@/lib/actions/quick-tailor"
import { CreateResumeDialog } from "@/components/resumes/create-resume-dialog"
import { ResumeList } from "@/components/resumes/resume-list"
import { QuickTailorResultsList } from "@/components/quick-tailor/quick-tailor-results-list"

export default async function ResumesPage() {
  const [resumes, careerTracks, quickTailorResults] = await Promise.all([
    listMyResumes(),
    listCareerTrackOptions(),
    listQuickTailorResults(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Resumes</h1>
          <p className="text-sm text-muted-foreground">Базовые резюме по трекам.</p>
        </div>
        <CreateResumeDialog careerTrackOptions={careerTracks.map((t) => ({ id: t.id, label: t.title }))} />
      </div>
      {quickTailorResults.length > 0 && (
        <QuickTailorResultsList
          items={quickTailorResults}
          title="Результаты экспресс-тюнинга"
          description="Версии резюме, созданные через /quick-tailor."
        />
      )}
      <ResumeList resumes={resumes} />
    </div>
  )
}
