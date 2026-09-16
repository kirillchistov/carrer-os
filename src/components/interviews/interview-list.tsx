import Link from "next/link"
import type { Interview } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddInterviewDialog } from "@/components/interviews/add-interview-dialog"
import { INTERVIEW_TYPE_LABELS } from "@/lib/opportunities/labels"

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric" }).format(date)
}

export function InterviewList({ opportunityId, interviews }: { opportunityId: string; interviews: Interview[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Интервью</CardTitle>
        <AddInterviewDialog opportunityId={opportunityId} />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {interviews.length === 0 && <p className="text-sm text-muted-foreground">Интервью пока не записаны.</p>}
        {interviews.map((interview) => (
          <Link
            key={interview.id}
            href={`/interviews/${interview.id}`}
            className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Badge variant="outline">{INTERVIEW_TYPE_LABELS[interview.stage]}</Badge>
              <span>{formatDate(interview.date)}</span>
              {interview.interviewerName && (
                <span className="text-muted-foreground">— {interview.interviewerName}</span>
              )}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
