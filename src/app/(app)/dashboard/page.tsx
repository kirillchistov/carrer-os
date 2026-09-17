import Link from "next/link"
import { Sparkles } from "lucide-react"
import { requireCurrentUser } from "@/lib/auth/session"
import { getDashboardSummary, getOnboardingProgress } from "@/lib/queries/dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist"
import { OPPORTUNITY_STATUS_LABELS } from "@/lib/opportunities/labels"

const WIDGETS = [
  {
    key: "needingAction",
    title: "Требуют действия",
    empty: "Пока нет возможностей, которые требуют действия в ближайшие 7 дней.",
    href: "/pipeline",
  },
  {
    key: "followUpsDue",
    title: "Follow-up скоро",
    empty: "Нет запланированных follow-up на ближайшую неделю.",
    href: "/pipeline",
  },
  {
    key: "upcomingInterviews",
    title: "Интервью на неделе",
    empty: "На ближайшую неделю интервью не запланированы.",
    href: "/opportunities",
  },
] as const

export default async function DashboardPage() {
  const user = await requireCurrentUser()
  const [summary, progress] = await Promise.all([
    getDashboardSummary(user.id),
    getOnboardingProgress(user.id),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Дашборд</h1>
        <p className="text-sm text-muted-foreground">
          Обзор текущей воронки и следующих шагов.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-4.5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium">Экспресс-тюнинг резюме</p>
              <p className="text-sm text-muted-foreground">Резюме + вакансия → сверка требований, уточнения и письмо.</p>
            </div>
          </div>
          <Button render={<Link href="/quick-tailor" />} nativeButton={false} size="sm">
            Попробовать
          </Button>
        </CardContent>
      </Card>

      <OnboardingChecklist progress={progress} />

      <div className="grid gap-4 sm:grid-cols-3">
        {WIDGETS.map((widget) => {
          const count = summary[widget.key]
          return (
            <Link key={widget.key} href={widget.href} className="block">
              <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
                <CardHeader className="pb-2">
                  <CardDescription>{widget.title}</CardDescription>
                  <CardTitle className="text-3xl">{count}</CardTitle>
                </CardHeader>
                {count === 0 && (
                  <CardContent className="text-sm text-muted-foreground">{widget.empty}</CardContent>
                )}
              </Card>
            </Link>
          )
        })}
      </div>

      <Link href="/pipeline" className="block">
        <Card className="transition-colors hover:border-primary/40 hover:bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">Возможности по этапам</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.applicationsByStage.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Пока нет сохранённых возможностей — начните с раздела «Opportunities».
              </p>
            ) : (
              <ul className="grid gap-2 text-sm sm:grid-cols-2">
                {summary.applicationsByStage.map((row) => (
                  <li key={row.status} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-muted-foreground">{OPPORTUNITY_STATUS_LABELS[row.status]}</span>
                    <span className="font-medium">{row._count._all}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
