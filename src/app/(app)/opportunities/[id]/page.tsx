import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getOpportunity } from "@/lib/actions/opportunities"
import { listOpportunityTasks } from "@/lib/actions/tasks"
import { NotFoundError } from "@/lib/errors"
import { OpportunityDetailForm } from "@/components/opportunities/opportunity-detail-form"
import { RequirementsEditor } from "@/components/opportunities/requirements-editor"
import { OpportunityTasks } from "@/components/opportunities/opportunity-tasks"
import { DeleteOpportunityButton } from "@/components/opportunities/delete-opportunity-button"
import type { OpportunityFormValues, RequirementFormValues } from "@/lib/validation/opportunity"

function toIso(date: Date | null): string | null {
  return date ? date.toISOString() : null
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let data: Awaited<ReturnType<typeof getOpportunity>>
  try {
    data = await getOpportunity(id)
  } catch (error) {
    if (error instanceof NotFoundError) notFound()
    throw error
  }

  const tasks = await listOpportunityTasks(id)
  const { opportunity, requirements } = data

  const defaultValues: OpportunityFormValues = {
    type: opportunity.type,
    companyName: opportunity.companyName,
    title: opportunity.title,
    sourceUrl: opportunity.sourceUrl,
    location: opportunity.location,
    workMode: opportunity.workMode,
    employmentFormat: opportunity.employmentFormat,
    compensationMin: opportunity.compensationMin,
    compensationMax: opportunity.compensationMax,
    compensationCurrency: opportunity.compensationCurrency,
    rawDescription: opportunity.rawDescription,
    status: opportunity.status,
    priority: opportunity.priority,
    nextAction: opportunity.nextAction,
    nextActionDueAt: toIso(opportunity.nextActionDueAt),
    followUpAt: toIso(opportunity.followUpAt),
    deadlineAt: toIso(opportunity.deadlineAt),
    notes: opportunity.notes,
  }

  const requirementValues: RequirementFormValues[] = requirements.map((r) => ({
    id: r.id,
    category: r.category,
    text: r.text,
    importance: r.importance,
    normalizedSkill: r.normalizedSkill,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/opportunities"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Opportunities
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {opportunity.title} — {opportunity.companyName}
          </h1>
          {opportunity.sourceUrl && (
            <a
              href={opportunity.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Источник
            </a>
          )}
        </div>
        <DeleteOpportunityButton opportunityId={id} />
      </div>

      <OpportunityDetailForm
        opportunityId={id}
        defaultValues={defaultValues}
        rawDescription={opportunity.rawDescription}
      />
      <RequirementsEditor opportunityId={id} initialRequirements={requirementValues} />
      <OpportunityTasks opportunityId={id} tasks={tasks} />
    </div>
  )
}
