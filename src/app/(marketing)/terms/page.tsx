export default function TermsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Оферта</p>
      <h1 className="font-sans text-4xl font-black tracking-tight">Условия использования</h1>
      <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Пользуясь сервисом, вы соглашаетесь, что материалы загружаете вы сами, а AI только
          переформулирует предоставленный текст. Сервис не гарантирует оффер, прохождение ATS или
          «совпадение на N процентов».
        </p>
        <p>
          AI-кредиты — внутренние единицы учёта запросов. Стартовый пакет выдаётся при создании
          профиля. Пополнение через оплату пока не подключено.
        </p>
        <p>
          Запрещено загружать чужие персональные данные без оснований, пытаться обойти лимиты или
          использовать сервис для массовой рассылки.
        </p>
        <p>
          Аккаунт можно удалить в Настройках. Это черновик оферты: юридическая редакция — отдельным
          шагом перед платной рекламой.
        </p>
      </div>
    </main>
  )
}
