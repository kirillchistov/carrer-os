import { requireCurrentUser } from "@/lib/auth/session"
import { getDashboardSummary, getOnboardingProgress } from "@/lib/queries/dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist"

const WIDGETS = [
  {
    key: "needingAction",
    title: "Требуют действия",
    empty: "Пока нет возможностей, которые требуют действия в ближайшие 7 дней.",
  },
  {
    key: "followUpsDue",
    title: "Follow-up скоро",
    empty: "Нет запланированных follow-up на ближайшую неделю.",
  },
  {
    key: "upcomingInterviews",
    title: "Интервью на неделе",
    empty: "На ближайшую неделю интервью не запланированы.",
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
        <h1 className="text-2xl font-semibold tracking-tight">Дашборд</h1>
        <p className="text-sm text-muted-foreground">
          Обзор текущей воронки и следующих шагов.
        </p>
      </div>

      <OnboardingChecklist progress={progress} />

      <div className="grid gap-4 sm:grid-cols-3">
        {WIDGETS.map((widget) => {
          const count = summary[widget.key]
          return (
            <Card key={widget.key}>
              <CardHeader className="pb-2">
                <CardDescription>{widget.title}</CardDescription>
                <CardTitle className="text-3xl">{count}</CardTitle>
              </CardHeader>
              {count === 0 && (
                <CardContent className="text-sm text-muted-foreground">{widget.empty}</CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <Card>
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
                  <span className="text-muted-foreground">{row.status}</span>
                  <span className="font-medium">{row._count._all}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
