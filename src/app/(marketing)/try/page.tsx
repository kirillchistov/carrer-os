import { CtaLink } from "@/components/marketing/cta-link"

export default function TryPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-4 py-16 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Экспресс-тюнинг</p>
      <h1 className="font-sans text-4xl font-black tracking-tight sm:text-5xl">
        Войти и сразу к вакансии
      </h1>
      <p className="text-muted-foreground text-pretty">
        Чтобы сохранить результат и списать кредиты, нужен аккаунт. Онбординг профиля для этого
        сценария не запускается — после входа откроется мастер адаптации.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <CtaLink href="/signup?next=%2Fquick-tailor">Создать аккаунт</CtaLink>
        <CtaLink href="/login?next=%2Fquick-tailor" variant="outline">
          У меня уже есть вход
        </CtaLink>
      </div>
    </main>
  )
}
