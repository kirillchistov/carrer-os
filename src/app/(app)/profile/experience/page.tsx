import { listMyExperiences } from "@/lib/actions/experience"
import { ExperienceImportPanel } from "@/components/experience/experience-import-panel"
import { ExperienceList } from "@/components/experience/experience-list"
import { AddExperienceDialog } from "@/components/experience/add-experience-dialog"

export default async function ExperiencePage() {
  const experiences = await listMyExperiences()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Опыт работы</h1>
        <p className="text-sm text-muted-foreground">
          Импортируйте резюме или добавьте роли вручную — это основа для Evidence Bank и
          карьерных треков.
        </p>
      </div>

      <ExperienceImportPanel />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Записи об опыте ({experiences.length})</h2>
        <AddExperienceDialog />
      </div>

      <ExperienceList experiences={experiences} />
    </div>
  )
}
