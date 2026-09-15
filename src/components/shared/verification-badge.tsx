import { Badge } from "@/components/ui/badge"
import { cn } from "cn"

const LABELS: Record<string, string> = {
  unverified: "Черновик — не подтверждено",
  verified: "Подтверждено",
  edited: "Отредактировано",
  rejected: "Отклонено",
}

const STYLES: Record<string, string> = {
  unverified: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  verified: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  edited: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  rejected: "bg-muted text-muted-foreground",
}

export function VerificationBadge({ status }: { status: string }) {
  return (
    <Badge variant="secondary" className={cn("border-none", STYLES[status])}>
      {LABELS[status] ?? status}
    </Badge>
  )
}
