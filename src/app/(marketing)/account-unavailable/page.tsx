import { AuthCard } from "@/components/auth/auth-card"
import { CtaLink } from "@/components/marketing/cta-link"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/actions/auth"

export default function AccountUnavailablePage() {
  return (
    <AuthCard
      title="Аккаунт ещё не готов"
      description="Профиль в базе не создался. Обычно помогает обновить страницу через несколько секунд."
    >
      <div className="flex flex-col gap-3">
        <CtaLink href="/dashboard" className="w-full">
          Попробовать снова
        </CtaLink>
        <form action={signOut}>
          <Button type="submit" variant="outline" className="w-full">
            Выйти и войти заново
          </Button>
        </form>
      </div>
    </AuthCard>
  )
}
