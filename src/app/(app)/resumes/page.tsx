import { listMyResumes } from "@/lib/actions/resumes"
import { listCareerTrackOptions } from "@/lib/actions/evidence"
import { listQuickTailorResults } from "@/lib/actions/quick-tailor"
import { CreateResumeDialog } from "@/components/resumes/create-resume-dialog"
import { ResumeList } from "@/components/resumes/resume-list"
import { QuickTailorResultsList } from "@/components/quick-tailor/quick-tailor-results-list"
import { EmptyState } from "@/components/shared/empty-state"

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
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Резюме</h1>
          <p className="text-sm text-muted-foreground">Базовые резюме по трекам.</p>
        </div>
        <CreateResumeDialog careerTrackOptions={careerTracks.map((t) => ({ id: t.id, label: t.title }))} />
      </div>
      {quickTailorResults.length > 0 && (
        <QuickTailorResultsList
          items={quickTailorResults}
          title="Результаты экспресс-тюнинга"
          description="Версии резюме, созданные через экспресс-тюнинг."
        />
      )}
      {resumes.length === 0 && quickTailorResults.length === 0 ? (
        <EmptyState
          title="Резюме ещё нет"
          description="Адаптируйте резюме под вакансию за три шага — без онбординга."
          actionHref="/quick-tailor"
          actionLabel="Экспресс-тюнинг"
        />
      ) : (
        <ResumeList resumes={resumes} />
      )}
    </div>
  )
}
