import { QuickTailorWizard } from "@/components/quick-tailor/quick-tailor-wizard"
import { QuickTailorResultsList } from "@/components/quick-tailor/quick-tailor-results-list"
import { listQuickTailorResults } from "@/lib/actions/quick-tailor"
import { getMyCreditAccount } from "@/lib/actions/account"
import {
  QUICK_TAILOR_GENERATE_CREDIT_COST,
  QUICK_TAILOR_MATCH_CREDIT_COST,
} from "@/lib/quick-tailor/costs"
import { creditLabel } from "@/lib/quick-tailor/summary"

export default async function QuickTailorPage() {
  const [history, creditAccount] = await Promise.all([listQuickTailorResults(), getMyCreditAccount()])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Экспресс-тюнинг резюме</h1>
        <p className="text-sm text-muted-foreground">
          Резюме и одна вакансия → сверка требований → уточнения без выдумки → адаптированное резюме
          и письмо. Сверка списывает {creditLabel(QUICK_TAILOR_MATCH_CREDIT_COST)}, сборка —{" "}
          {creditLabel(QUICK_TAILOR_GENERATE_CREDIT_COST)}. Результат сохраняется в Opportunities и
          Resumes.
        </p>
      </div>
      <QuickTailorWizard creditBalance={creditAccount?.balance ?? null} />
      {history.length > 0 && (
        <QuickTailorResultsList
          items={history}
          title="Прошлые результаты"
          description="Откройте версию, скачайте файл или продолжите работу с возможностью."
        />
      )}
    </div>
  )
}
