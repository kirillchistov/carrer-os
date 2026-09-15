import { requireCurrentUser } from "@/lib/auth/session"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/actions/auth"

export default async function SettingsPage() {
  const user = await requireCurrentUser()

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
          <div>
            <p className="mb-2 text-sm text-muted-foreground">
              Баланс AI-кредитов и история обращений «Сообщить об ошибке в разборе»
              появятся вместе с AI-функциями (Phase 4).
            </p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Выйти из аккаунта
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
