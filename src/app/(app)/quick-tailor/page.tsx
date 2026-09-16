import { QuickTailorWizard } from "@/components/quick-tailor/quick-tailor-wizard"
import { QuickTailorResultsList } from "@/components/quick-tailor/quick-tailor-results-list"
import { listQuickTailorResults } from "@/lib/actions/quick-tailor"

export default async function QuickTailorPage() {
  const history = await listQuickTailorResults()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Экспресс-тюнинг резюме</h1>
        <p className="text-sm text-muted-foreground">
          Резюме → 1–3 вакансии → адаптированные версии резюме с комментариями и сопроводительными
          письмами. Каждый шаг использует AI-кредиты (≈3 за вакансию) и создаёт реальные записи в
          Opportunities и Resumes — с этим можно продолжить работать и после.
        </p>
      </div>
      <QuickTailorWizard />
      {history.length > 0 && (
        <QuickTailorResultsList
          items={history}
          title="Прошлые результаты"
          description="Возвращайтесь сюда, чтобы открыть, скачать или продолжить работу с уже сгенерированными версиями."
        />
      )}
    </div>
  )
}
