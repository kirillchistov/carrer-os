const MIN_LEN = 20

export type EvidenceQualityInput = {
  situation: string | null
  task: string | null
  action: string | null
  result: string | null
  metricValue: number | null
}

export type EvidenceQualityScore = {
  score: number
  explanation: string
}

const CHECKS: {
  key: keyof EvidenceQualityInput
  weight: number
  label: string
  present: (input: EvidenceQualityInput) => boolean
}[] = [
  {
    key: "situation",
    weight: 20,
    label: "контекст (ситуация)",
    present: (i) => !!i.situation && i.situation.trim().length >= MIN_LEN,
  },
  {
    key: "task",
    weight: 15,
    label: "задача",
    present: (i) => !!i.task && i.task.trim().length >= MIN_LEN,
  },
  {
    key: "action",
    weight: 25,
    label: "ваши действия",
    present: (i) => !!i.action && i.action.trim().length >= MIN_LEN,
  },
  {
    key: "result",
    weight: 25,
    label: "результат",
    present: (i) => !!i.result && i.result.trim().length >= MIN_LEN,
  },
  {
    key: "metricValue",
    weight: 15,
    label: "количественная метрика",
    present: (i) => i.metricValue !== null,
  },
]

/**
 * Deterministic, explainable evidence-completeness score — not a judgment of the person,
 * only of whether the CAR/STAR fields are filled in enough to be usable. See
 * docs/product-plan.md, "Evidence Bank": "add evidence quality score with explanation,
 * but never use it as an evaluation of the person."
 */
export function computeEvidenceQualityScore(input: EvidenceQualityInput): EvidenceQualityScore {
  const missing = CHECKS.filter((check) => !check.present(input))
  const score = CHECKS.filter((check) => check.present(input)).reduce((sum, c) => sum + c.weight, 0)

  const explanation =
    missing.length === 0
      ? "Все ключевые элементы указаны: ситуация, задача, действия, результат и метрика."
      : `Не хватает: ${missing.map((c) => c.label).join(", ")}.`

  return { score, explanation }
}
