import { listMyOpportunities } from "@/lib/actions/opportunities"
import { KanbanBoard } from "@/components/pipeline/kanban-board"

export default async function PipelinePage() {
  const opportunities = await listMyOpportunities()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Воронка</h1>
        <p className="text-sm text-muted-foreground">
          На телефоне смените этап в списке на карточке. На компьютере карточки можно перетаскивать.
        </p>
      </div>
      <KanbanBoard initialOpportunities={opportunities} />
    </div>
  )
}
