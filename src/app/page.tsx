import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const pillars = [
  {
    title: "Доказательства, а не обязанности",
    description:
      "Превратите многолетний опыт в структурированные карточки результатов — с контекстом, вкладом и метрикой, которые можно переиспользовать в резюме, на интервью и в письмах.",
  },
  {
    title: "Честный fit-анализ",
    description:
      "По каждой возможности — объяснимый разбор по 10 измерениям: что совпадает, что доказано, что является реальным пробелом, а что нужно уточнить у работодателя.",
  },
  {
    title: "Воронка вместо хаоса",
    description:
      "Вакансии, письма, версии резюме и заметки по интервью — в одном месте, с понятным следующим шагом на каждом этапе.",
  },
]

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-start justify-center gap-6 px-4 py-24">
        <p className="text-sm font-medium text-muted-foreground">Career Evidence OS</p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
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
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-16 sm:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="border-none bg-transparent shadow-none">
              <CardHeader className="px-0">
                <CardTitle className="text-base">{pillar.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-0 text-sm text-muted-foreground">
                {pillar.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
