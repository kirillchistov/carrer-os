import { listMyOpportunities } from "@/lib/actions/opportunities"
import { KanbanBoard } from "@/components/pipeline/kanban-board"

export default async function PipelinePage() {
  const opportunities = await listMyOpportunities()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          Перетаскивайте карточки между этапами воронки.
        </p>
      </div>
      <KanbanBoard initialOpportunities={opportunities} />
    </div>
  )
}
