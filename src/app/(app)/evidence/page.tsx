import { listCareerTrackOptions, listExperienceOptions, listMyEvidence } from "@/lib/actions/evidence"
import { AddEvidenceDialog } from "@/components/evidence/add-evidence-dialog"
import { EvidenceCard } from "@/components/evidence/evidence-card"

export default async function EvidencePage() {
  const [evidence, careerTracks, experiences] = await Promise.all([
    listMyEvidence(),
    listCareerTrackOptions(),
    listExperienceOptions(),
  ])

  const careerTrackOptions = careerTracks.map((t) => ({ id: t.id, label: t.title }))
  const experienceOptions = experiences.map((e) => ({ id: e.id, label: `${e.title} — ${e.companyName}` }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Evidence Bank</h1>
          <p className="text-sm text-muted-foreground">
            Карточки достижений: ситуация, действия, результат, метрика.
          </p>
        </div>
        <AddEvidenceDialog careerTrackOptions={careerTrackOptions} experienceOptions={experienceOptions} />
      </div>

      {evidence.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Доказательств пока нет. Добавьте хотя бы три — это основа для сильного резюме и
          честного fit-анализа.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {evidence.map((item) => (
            <EvidenceCard
              key={item.id}
              evidence={item}
              careerTrackOptions={careerTrackOptions}
              experienceOptions={experienceOptions}
            />
          ))}
        </div>
      )}
    </div>
  )
}
