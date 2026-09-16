import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getResumeVersionWithProposals } from "@/lib/actions/resume-proposals"
import { requireCurrentUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { NotFoundError } from "@/lib/errors"
import { ProposalCard } from "@/components/resumes/proposal-card"
import { ResumeContentPreview } from "@/components/resumes/resume-content-preview"
import { RegenerateProposalsCard } from "@/components/resumes/regenerate-proposals-card"
import { ExportButtons } from "@/components/resumes/export-buttons"

export default async function ResumeVersionPage({
  params,
}: {
  params: Promise<{ id: string; versionId: string }>
}) {
  const { id, versionId } = await params
  const user = await requireCurrentUser()

  let data: Awaited<ReturnType<typeof getResumeVersionWithProposals>>
  try {
    data = await getResumeVersionWithProposals(versionId)
  } catch (error) {
    if (error instanceof NotFoundError) notFound()
    throw error
  }

  const { resumeVersion, proposals, content } = data

  const evidenceIds = Array.from(new Set(proposals.flatMap((p) => (Array.isArray(p.evidenceIds) ? (p.evidenceIds as string[]) : []))))
  const evidenceRows = evidenceIds.length
    ? await prisma.evidence.findMany({ where: { id: { in: evidenceIds }, userId: user.id }, select: { id: true, title: true } })
    : []
  const evidenceTitles = new Map(evidenceRows.map((e) => [e.id, e.title]))

  const pending = proposals.filter((p) => p.status === "proposed")
  const resolved = proposals.filter((p) => p.status !== "proposed")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/resumes/${id}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            {resumeVersion.name.split(" — ")[0] || "Resume"}
          </Link>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{resumeVersion.name}</h1>
          <p className="text-sm text-muted-foreground">
            Версия под конкретную возможность. Проверьте каждое предложение перед принятием — AI не
            добавляет фактов, которых не было в ваших данных.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <ExportButtons exportUrl={`/api/resume-versions/${versionId}/export`} />
        </div>
      </div>

      {proposals.length === 0 && <RegenerateProposalsCard resumeVersionId={versionId} />}

      {pending.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Предложения на рассмотрении ({pending.length})</h2>
          {pending.map((p) => (
            <ProposalCard key={p.id} proposal={p} content={content} evidenceTitles={evidenceTitles} />
          ))}
        </div>
      )}

      {content && <ResumeContentPreview content={content} />}

      {resolved.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Рассмотренные предложения</h2>
          {resolved.map((p) => (
            <ProposalCard key={p.id} proposal={p} content={content} evidenceTitles={evidenceTitles} />
          ))}
        </div>
      )}
    </div>
  )
}
