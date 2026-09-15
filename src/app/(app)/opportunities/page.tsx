import { listMyOpportunities } from "@/lib/actions/opportunities"
import { CreateOpportunityDialog } from "@/components/opportunities/create-opportunity-dialog"
import { OpportunityList } from "@/components/opportunities/opportunity-list"

export default async function OpportunitiesPage() {
  const opportunities = await listMyOpportunities()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Opportunities</h1>
          <p className="text-sm text-muted-foreground">
            Вакансии, проекты, fractional- и advisory-возможности.
          </p>
        </div>
        <CreateOpportunityDialog />
      </div>
      <OpportunityList opportunities={opportunities} />
    </div>
  )
}
