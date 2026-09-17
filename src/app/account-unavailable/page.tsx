import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/actions/auth"

export default function AccountUnavailablePage() {
  return (
    <AuthCard
      title="Аккаунт ещё не готов"
      description="Профиль в базе не создался. Обычно помогает обновить страницу через несколько секунд."
    >
      <div className="flex flex-col gap-3">
        <Button nativeButton={false} render={<Link href="/dashboard" />} className="w-full">
          Попробовать снова
        </Button>
        <form action={signOut}>
          <Button type="submit" variant="outline" className="w-full">
            Выйти и войти заново
          </Button>
        </form>
      </div>
    </AuthCard>
  )
}
