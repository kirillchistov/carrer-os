import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref: string
  actionLabel: string
}) {
  return (
    <div className="flex max-w-lg flex-col items-start gap-3 rounded-xl border border-dashed border-border p-8">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground text-pretty">{description}</p>
      <Link href={actionHref} className={cn(buttonVariants(), "mt-1")}>
        {actionLabel}
      </Link>
    </div>
  )
}
