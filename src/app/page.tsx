import Link from "next/link"
import { FileCheck2, ShieldCheck, Waypoints, Upload, FileSearch, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const quickStartSteps = [
  {
    icon: Upload,
    title: "1. Загрузите резюме",
    description: "Вставьте текст или загрузите .docx — без регистрации данных, без предварительной настройки профиля.",
  },
  {
    icon: FileSearch,
    title: "2. Добавьте 1–3 вакансии",
    description: "Вставьте текст описаний вакансий, на которые откликаетесь или присматриваетесь.",
  },
  {
    icon: Sparkles,
    title: "3. Получите результат",
    description: "Адаптированные версии резюме с комментариями, что и почему изменено, плюс сопроводительные письма.",
  },
]

const pillars = [
  {
    icon: FileCheck2,
    title: "Доказательства, а не обязанности",
    description:
      "Превратите многолетний опыт в структурированные карточки результатов — с контекстом, вкладом и метрикой, которые можно переиспользовать в резюме, на интервью и в письмах.",
  },
  {
    icon: ShieldCheck,
    title: "Честный fit-анализ",
    description:
      "По каждой возможности — объяснимый разбор по 10 измерениям: что совпадает, что доказано, что является реальным пробелом, а что нужно уточнить у работодателя.",
  },
  {
    icon: Waypoints,
    title: "Воронка вместо хаоса",
    description:
      "Вакансии, письма, версии резюме и заметки по интервью — в одном месте, с понятным следующим шагом на каждом этапе.",
  },
]

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,color-mix(in_oklch,var(--primary)_15%,transparent),transparent)]"
          aria-hidden
        />
        <div className="mx-auto flex w-full max-w-4xl flex-col items-start justify-center gap-6 px-4 py-24 sm:py-32">
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            Career Evidence OS
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Ваш опыт заслуживает точного языка, а не очередного резюме
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
            Мы помогаем руководителям и экспертам с многолетним и нелинейным опытом
            выбрать реалистичную траекторию, доказать ценность фактами и честно оценить
            fit с конкретной ролью, проектом или advisory-возможностью.
          </p>
          <div className="flex gap-3 pt-2">
            <Button render={<Link href="/signup" />} nativeButton={false} size="lg">
              Начать
            </Button>
            <Button render={<Link href="/login" />} nativeButton={false} size="lg" variant="outline">
              Войти
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-16">
          <div className="flex flex-col items-start gap-2">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Быстрый способ попробовать</h2>
            <p className="max-w-2xl text-muted-foreground">
              Не готовы выстраивать полную базу доказательств прямо сейчас? Экспресс-тюнинг резюме
              даёт результат за три шага — без онбординга.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {quickStartSteps.map((s) => (
              <Card key={s.title} className="gap-3">
                <CardHeader>
                  <span className="mb-1 flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <s.icon className="size-4.5" aria-hidden />
                  </span>
                  <CardTitle className="font-heading text-base font-semibold">{s.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{s.description}</CardContent>
              </Card>
            ))}
          </div>
          <Button render={<Link href="/signup" />} nativeButton={false} className="w-fit" size="lg">
            Попробовать экспресс-тюнинг
          </Button>
        </div>
      </section>

      <section className="border-t bg-muted/40">
        <div className="mx-auto grid w-full max-w-4xl gap-4 px-4 py-16 sm:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="gap-3">
              <CardHeader>
                <span className="mb-1 flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <pillar.icon className="size-4.5" aria-hidden />
                </span>
                <CardTitle className="font-heading text-base font-semibold">{pillar.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{pillar.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
