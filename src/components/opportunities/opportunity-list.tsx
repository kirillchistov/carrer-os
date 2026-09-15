import Link from "next/link"
import type { Opportunity } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OPPORTUNITY_STATUS_LABELS, OPPORTUNITY_TYPE_LABELS } from "@/lib/opportunities/labels"

export function OpportunityList({ opportunities }: { opportunities: Opportunity[] }) {
  if (opportunities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Возможностей пока нет. Вставьте ссылку на вакансию или текст описания выше.
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {opportunities.map((opp) => (
        <Link key={opp.id} href={`/opportunities/${opp.id}`}>
          <Card className="h-full transition-colors hover:bg-secondary/40">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="text-base">{opp.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{opp.companyName}</p>
              </div>
              <Badge variant="secondary">{OPPORTUNITY_TYPE_LABELS[opp.type]}</Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{OPPORTUNITY_STATUS_LABELS[opp.status]}</span>
              {opp.location && <span className="text-muted-foreground">{opp.location}</span>}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
