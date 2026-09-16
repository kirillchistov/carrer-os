import { QuickTailorWizard } from "@/components/quick-tailor/quick-tailor-wizard"

export default function QuickTailorPage() {
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
    </div>
  )
}
