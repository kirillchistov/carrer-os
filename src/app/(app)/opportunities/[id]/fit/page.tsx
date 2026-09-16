import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getOpportunity } from "@/lib/actions/opportunities"
import { listCareerTracksForFit, getLatestFitAssessment } from "@/lib/actions/fit-assessment"
import { requireCurrentUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { NotFoundError } from "@/lib/errors"
import { FitReportClient } from "@/components/fit/fit-report-client"

export default async function FitReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireCurrentUser()

  let data: Awaited<ReturnType<typeof getOpportunity>>
  try {
    data = await getOpportunity(id)
  } catch (error) {
    if (error instanceof NotFoundError) notFound()
    throw error
  }

  const [careerTracks, evidence] = await Promise.all([
    listCareerTracksForFit(),
    prisma.evidence.findMany({ where: { userId: user.id }, select: { id: true, title: true } }),
  ])

  const initialTrackId = careerTracks[0]?.id ?? null
  const initialAssessment = initialTrackId ? await getLatestFitAssessment(id, initialTrackId) : null

  const evidenceTitles = Object.fromEntries(evidence.map((e) => [e.id, e.title]))
  const requirementTexts = Object.fromEntries(data.requirements.map((r) => [r.id, r.text]))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/opportunities/${id}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {data.opportunity.title} — {data.opportunity.companyName}
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Fit Report</h1>
        <p className="text-sm text-muted-foreground">
          Объяснимый разбор по 10 измерениям — не прогноз интервью или оффера, а навигация:
          что совпадает, что доказано, что является пробелом, а что нужно уточнить.
        </p>
      </div>

      <FitReportClient
        opportunityId={id}
        careerTracks={careerTracks.map((t) => ({ id: t.id, title: t.title }))}
        initialTrackId={initialTrackId}
        initialAssessment={initialAssessment}
        evidenceTitles={evidenceTitles}
        requirementTexts={requirementTexts}
      />
    </div>
  )
}
