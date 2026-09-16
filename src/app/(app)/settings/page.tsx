import { requireCurrentUser } from "@/lib/auth/session"
import { getMyCreditAccount, listMyAiFeedbackReports, listMyRecentCreditTransactions } from "@/lib/actions/account"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/actions/auth"

const FEEDBACK_STATUS_LABELS: Record<string, string> = {
  open: "Открыто",
  reviewed: "Рассмотрено",
  dismissed: "Отклонено",
}

const CREDIT_REASON_LABELS: Record<string, string> = {
  ai_run_debit: "Использование AI",
  signup_bonus: "Стартовый бонус",
  manual_grant: "Начисление вручную",
  refund: "Возврат за ошибку",
}

export default async function SettingsPage() {
  const [user, creditAccount, transactions, feedbackReports] = await Promise.all([
    requireCurrentUser(),
    getMyCreditAccount(),
    listMyRecentCreditTransactions(),
    listMyAiFeedbackReports(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Аккаунт и системные настройки.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Аккаунт</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Язык интерфейса: </span>
            {user.locale === "ru" ? "Русский" : user.locale}
          </div>
          <Separator />
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Выйти из аккаунта
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI-кредиты</CardTitle>
          <CardDescription>
            Каждое обращение к AI (разбор опыта, Fit Report, предложения по резюме, письма)
            списывает кредиты — это не безлимитный доступ.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-3xl font-semibold">{creditAccount?.balance ?? 0}</p>
          {transactions.length > 0 && (
            <ul className="flex flex-col gap-1.5 text-sm">
              {transactions.map((t) => (
                <li key={t.id} className="flex items-center justify-between border-b py-1 last:border-none">
                  <span className="text-muted-foreground">{CREDIT_REASON_LABELS[t.reason] ?? t.reason}</span>
                  <span className={t.amount < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}>
                    {t.amount > 0 ? "+" : ""}
                    {t.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Сообщения об ошибках AI</CardTitle>
          <CardDescription>История ваших обращений «Сообщить об ошибке в разборе».</CardDescription>
        </CardHeader>
        <CardContent>
          {feedbackReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">Пока нет сообщений об ошибках.</p>
          ) : (
            <ul className="flex flex-col gap-3 text-sm">
              {feedbackReports.map((r) => (
                <li key={r.id} className="flex flex-col gap-1 border-b pb-3 last:border-none">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {r.targetType} · {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                    <Badge variant="secondary">{FEEDBACK_STATUS_LABELS[r.status] ?? r.status}</Badge>
                  </div>
                  {r.comment && <p>{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
