export const OPPORTUNITY_TYPE_LABELS: Record<string, string> = {
  vacancy: "Вакансия",
  project: "Проект",
  fractional: "Fractional",
  advisory: "Advisory",
  proactive_lead: "Проактивный контакт",
}

export const OPPORTUNITY_STATUS_LABELS: Record<string, string> = {
  saved: "Сохранено",
  researching: "Изучаю",
  ready_to_apply: "Готово к отклику",
  applied: "Откликнулась",
  recruiter_screen: "Скрининг рекрутера",
  hiring_manager: "Интервью с HM",
  case_test_task: "Кейс / тестовое",
  final_interview: "Финальное интервью",
  offer: "Оффер",
  rejected: "Отказ",
  withdrawn: "Отозвано",
  paused: "На паузе",
}

export const OPPORTUNITY_STATUS_ORDER = [
  "saved",
  "researching",
  "ready_to_apply",
  "applied",
  "recruiter_screen",
  "hiring_manager",
  "case_test_task",
  "final_interview",
  "offer",
  "rejected",
  "withdrawn",
  "paused",
] as const

export const REQUIREMENT_CATEGORY_LABELS: Record<string, string> = {
  responsibility: "Обязанность",
  skill: "Навык",
  tool: "Инструмент",
  qualification: "Квалификация",
  industry_experience: "Опыт в индустрии",
  logistics: "Логистика",
  other: "Другое",
}

export const REQUIREMENT_IMPORTANCE_LABELS: Record<string, string> = {
  must_have: "Обязательно",
  nice_to_have: "Желательно",
  inferred_context: "Контекст",
}

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
}
