import Link from "next/link"
import { FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { QuickTailorHistoryItem } from "@/lib/actions/quick-tailor"

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric" }).format(date)
}

export function QuickTailorResultsList({
  items,
  title = "Прошлые результаты",
  description,
  emptyText = "Результатов пока нет.",
}: {
  items: QuickTailorHistoryItem[]
  title?: string
  description?: string
  emptyText?: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">{emptyText}</p>}
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/resumes/${item.resumeId}/versions/${item.id}`}
            className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="font-medium">{item.title}</span>
              {item.companyName && <span className="text-muted-foreground">— {item.companyName}</span>}
            </div>
            <span className="shrink-0 text-muted-foreground">{formatDate(item.createdAt)}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
