export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">152-ФЗ</p>
      <h1 className="font-sans text-4xl font-black tracking-tight">Конфиденциальность</h1>
      <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Сервис обрабатывает персональные данные, чтобы вы могли хранить карьерные факты,
          адаптировать резюме под вакансию и вести воронку откликов.
        </p>
        <p>
          <strong className="text-foreground">Какие данные.</strong> Email аккаунта; текст резюме и
          вакансий, которые вы загружаете; производные материалы (fit, версии резюме, письма);
          технические логи входа.
        </p>
        <p>
          <strong className="text-foreground">Зачем.</strong> Исполнение договора на использование
          сервиса: сохранение ваших материалов, генерация адаптаций, учёт кредитов.
        </p>
        <p>
          <strong className="text-foreground">Кто ещё видит текст.</strong> Для AI-задач фрагменты
          резюме и вакансии передаются процессору Anthropic. Мы не продаём базу рекрутерам и не
          публикуем ваш профиль.
        </p>
        <p>
          <strong className="text-foreground">Срок.</strong> Пока аккаунт активен. После удаления
          аккаунта связанные записи в приложении удаляются каскадом.
        </p>
        <p>
          <strong className="text-foreground">Как удалить.</strong> В Настройках есть кнопка удаления
          аккаунта. Можно также написать на email, с которого вы зарегистрированы.
        </p>
      </div>
    </main>
  )
}
