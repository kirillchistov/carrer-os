import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getInterview, getLatestInterviewLearnings } from "@/lib/actions/interviews"
import { listCareerTrackOptions } from "@/lib/actions/evidence"
import { NotFoundError } from "@/lib/errors"
import { EditInterviewCard } from "@/components/interviews/edit-interview-card"
import { InterviewLearningsCard } from "@/components/interviews/interview-learnings-card"
import { DeleteInterviewButton } from "@/components/interviews/delete-interview-button"
import { INTERVIEW_TYPE_LABELS } from "@/lib/opportunities/labels"
import { questionsFromJson } from "@/lib/interviews/questions-format"
import type { InterviewFormValues } from "@/lib/validation/interview"

export default async function InterviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let data: Awaited<ReturnType<typeof getInterview>>
  try {
    data = await getInterview(id)
  } catch (error) {
    if (error instanceof NotFoundError) notFound()
    throw error
  }

  const { interview, opportunity } = data
  const [learnings, careerTracks] = await Promise.all([getLatestInterviewLearnings(id), listCareerTrackOptions()])
  const careerTrackOptions = careerTracks.map((t) => ({ id: t.id, label: t.title }))

  const defaultValues: InterviewFormValues = {
    date: interview.date.toISOString().slice(0, 10),
    stage: interview.stage,
    interviewerName: interview.interviewerName,
    interviewerTitle: interview.interviewerTitle,
    questions: questionsFromJson(interview.questions),
    notes: interview.notes,
    feedback: interview.feedback,
    interestSignals: interview.interestSignals,
    objections: interview.objections,
    agreements: interview.agreements,
    nextStep: interview.nextStep,
    nextStepAt: interview.nextStepAt ? interview.nextStepAt.toISOString().slice(0, 10) : null,
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/opportunities/${opportunity.id}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            {opportunity.title} — {opportunity.companyName}
          </Link>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {INTERVIEW_TYPE_LABELS[interview.stage]}
          </h1>
        </div>
        <DeleteInterviewButton interviewId={interview.id} />
      </div>

      <EditInterviewCard interviewId={interview.id} defaultValues={defaultValues} />
      <InterviewLearningsCard interviewId={interview.id} initialLearnings={learnings} careerTrackOptions={careerTrackOptions} />
    </div>
  )
}
