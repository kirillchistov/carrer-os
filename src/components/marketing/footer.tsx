import Link from "next/link"

export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span className="size-2 rounded-full bg-primary" aria-hidden />
          Career Evidence OS
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">
            Конфиденциальность
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Оферта
          </Link>
        </nav>
      </div>
    </footer>
  )
}
