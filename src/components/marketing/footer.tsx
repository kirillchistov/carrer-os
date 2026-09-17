export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span className="size-2 rounded-full bg-primary" aria-hidden />
          Career Evidence OS
        </p>
        <p className="text-sm text-muted-foreground">
          Политика конфиденциальности и оферта появятся отдельно. Данные резюме остаются в вашем
          аккаунте.
        </p>
      </div>
    </footer>
  )
}
