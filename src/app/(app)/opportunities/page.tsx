import { listMyOpportunities } from "@/lib/actions/opportunities"
import { CreateOpportunityDialog } from "@/components/opportunities/create-opportunity-dialog"
import { OpportunityList } from "@/components/opportunities/opportunity-list"
import { EmptyState } from "@/components/shared/empty-state"

export default async function OpportunitiesPage() {
  const opportunities = await listMyOpportunities()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Возможности</h1>
          <p className="text-sm text-muted-foreground">
            Вакансии, проекты, fractional- и advisory-возможности.
          </p>
        </div>
        <CreateOpportunityDialog />
      </div>
      {opportunities.length === 0 ? (
        <EmptyState
          title="Пока нет возможностей"
          description="Вставьте вакансию в экспресс-тюнинг — она сохранится здесь, и по ней можно вести воронку."
          actionHref="/quick-tailor"
          actionLabel="Экспресс-тюнинг"
        />
      ) : (
        <OpportunityList opportunities={opportunities} />
      )}
    </div>
  )
}
