import { CtaLink } from "@/components/marketing/cta-link"
import { WordField } from "@/components/marketing/word-field"

const steps = [
  {
    n: "01",
    title: "Резюме",
    body: "Текст, DOCX или PDF. Берём только то, что уже написано — ничего не дописываем «для красоты».",
  },
  {
    n: "02",
    title: "Одна вакансия",
    body: "Текст, URL или файл. Сначала матрица совпадений: что закрыто, что слабо, что нужно уточнить.",
  },
  {
    n: "03",
    title: "Документ",
    body: "Адаптированное резюме, сопроводительное и комментарии. Можно править и скачать PDF или DOCX.",
  },
]

const audiences = [
  {
    label: "GM / директор",
    body: "Много контуров ответственности. Нужен язык масштаба и результата, а не список функций.",
  },
  {
    label: "COO / операции",
    body: "Цикл, маржа, команда, внедрение. Вакансия спрашивает про конкретный рычаг — резюме должно отвечать.",
  },
  {
    label: "CMO / рост",
    body: "Каналы и бренды менялись. Важно не «делал маркетинг», а какой рост и на каких ограничениях.",
  },
  {
    label: "Fractional / advisory",
    body: "Нелинейный трек. Под каждую роль собирается своя витрина фактов, без нового «универсального» PDF.",
  },
]

const faqs = [
  {
    q: "Нужна ли регистрация?",
    a: "Да — вход по email занимает около минуты. Онбординг профиля для экспресс-тюнинга не нужен: после входа сразу мастер адаптации.",
  },
  {
    q: "Вы дописываете опыт, которого не было?",
    a: "Нет. Модель переформулирует то, что есть во входе. Если факта не хватает, появятся уточняющие вопросы, а не вымысел.",
  },
  {
    q: "Можно загрузить PDF?",
    a: "Да, PDF и DOCX. Если текст из файла не читается, вставьте его вручную.",
  },
  {
    q: "Сколько вакансий за раз?",
    a: "В экспресс-сценарии — одна. Так проще увидеть fit и не смешать требования двух ролей.",
  },
  {
    q: "Что происходит с данными?",
    a: "Резюме, вакансия и результат сохраняются в вашем аккаунте, чтобы их можно было править и вернуться. Это не публичная витрина.",
  },
  {
    q: "Сколько это стоит?",
    a: "Анализ вакансии списывает 1 кредит, сборка резюме — 3. Новый аккаунт получает стартовый пакет, без карты.",
  },
]

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden">
        <WordField />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
          <p className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            3 шага · без онбординга
          </p>
          <h1 className="max-w-4xl font-sans text-5xl font-black leading-[0.95] tracking-tight text-balance sm:text-7xl lg:text-8xl">
            Резюме
            <br />
            под вакансию
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground text-pretty sm:text-xl">
            Для руководителей и экспертов с длинным, нелинейным опытом. Экспресс-тюнинг собирает
            факты из вашего резюме под одну роль — не пишет карьеру заново.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <CtaLink href="/try" event="landing_cta_click">
              Адаптировать резюме
            </CtaLink>
            <CtaLink href="/login" variant="outline">
              Войти
            </CtaLink>
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-20 border-t border-border/60">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:py-24">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Как это работает</p>
            <h2 className="font-sans text-3xl font-black tracking-tight sm:text-4xl">
              Сначала fit, потом текст
            </h2>
            <p className="text-muted-foreground text-pretty">
              Не три одинаковые карточки. Сначала видно, где опыт закрывает вакансию, где дыра,
              и какие формулировки уже можно усилить без выдумки.
            </p>
          </div>
          <ol className="flex flex-col gap-8">
            {steps.map((step) => (
              <li key={step.n} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                <span className="font-mono text-sm text-primary">{step.n}</span>
                <h3 className="font-sans text-xl font-bold tracking-tight">{step.title}</h3>
                <p className="col-start-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="express" className="scroll-mt-20 border-t border-border/60">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Пример</p>
            <h2 className="font-sans text-3xl font-black tracking-tight sm:text-4xl">
              Одна строка до и после
            </h2>
            <p className="text-muted-foreground">
              Иллюстрация приёма, не чужой кейс. Универсальная фраза не отвечает на вопрос вакансии
              про масштаб.
            </p>
          </div>
          <div className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card p-6 sm:p-8">
            <div>
              <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                Было
              </p>
              <p className="text-muted-foreground">Управлял командой продаж в регионе.</p>
            </div>
            <div className="h-px bg-border" />
            <div>
              <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-primary">
                Стало
              </p>
              <p className="font-medium leading-relaxed">
                Собрал B2B-воронку на трёх рынках: цикл сделки короче, win-rate выше — на цифрах из
                вашего файла, не из шаблона.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:py-24">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Почему не одно резюме</p>
            <h2 className="font-sans text-3xl font-black tracking-tight sm:text-4xl">
              Рекрутер не читает «делал всё»
            </h2>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            На скрининг уходят секунды. Универсальный PDF хоронит сильные факты в общем стаже. Мы
            не обещаем «пройти ATS любой ценой» — обещаем, что формулировки будут про эту роль, из
            ваших же данных.
          </p>
        </div>
      </section>

      <section id="who" className="scroll-mt-20 border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-20 sm:px-6 lg:py-24">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Для кого</p>
            <h2 className="max-w-2xl font-sans text-3xl font-black tracking-tight sm:text-4xl">
              Когда карьера длиннее одного трека
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-3xl border border-border/80 bg-border/80 sm:grid-cols-2">
            {audiences.map((item) => (
              <article key={item.label} className="bg-card p-6 sm:p-8">
                <h3 className="font-sans text-lg font-bold">{item.label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-20 sm:px-6 lg:py-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Дальше, если останетесь</p>
          <h2 className="max-w-3xl font-sans text-3xl font-black tracking-tight sm:text-5xl">
            Полный контур — доказательства, fit по 10 измерениям, воронка
          </h2>
          <p className="max-w-2xl text-muted-foreground text-pretty">
            Экспресс-тюнинг — вход. Внутри: банк фактов, разбор возможности без «магического
            процента совпадения», канбан откликов и заметки после интервью. Это не обязательно в
            первый вечер.
          </p>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 border-t border-border/60">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">FAQ</p>
            <h2 className="mt-3 font-sans text-3xl font-black tracking-tight sm:text-4xl">
              Коротко по делу
            </h2>
          </div>
          <div className="divide-y divide-border/80 border-y border-border/80">
            {faqs.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="cursor-pointer list-none font-sans text-base font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-4">
                    {item.q}
                    <span className="text-primary transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60">
        <div className="relative overflow-hidden">
          <WordField />
          <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:px-6 lg:py-28">
            <h2 className="max-w-3xl font-sans text-4xl font-black tracking-tight sm:text-6xl">
              Адаптировать резюме под эту роль
            </h2>
            <p className="max-w-lg text-muted-foreground">
              Войдите за полминуты. Онбординг можно пройти позже — экспресс-тюнинг его не требует.
            </p>
            <CtaLink href="/try" event="landing_cta_click">
              Начать
            </CtaLink>
          </div>
        </div>
      </section>
    </main>
  )
}
