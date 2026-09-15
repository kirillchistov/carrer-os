/**
 * Demo data for local development and manual QA.
 *
 * This inserts a `User` row directly via Prisma, without a matching Supabase
 * `auth.users` row — you cannot log in as this user through the UI (auth requires a
 * real Supabase account). It's meant for browsing the data model in Prisma Studio and
 * for future integration tests. To interact with demo data through the UI, sign up
 * normally and use the `DEMO_USER_ID` env var to point this script at your own
 * account's id instead (find it in Supabase Auth → Users).
 *
 * Run with: pnpm prisma db seed
 */
import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const DEMO_USER_ID = process.env.DEMO_USER_ID ?? "00000000-0000-4000-8000-000000000001"
const DEMO_EMAIL = "demo.candidate@career-evidence-os.test"

async function main() {
  const user = await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: DEMO_EMAIL,
      displayName: "Марина Соколова",
      locale: "ru",
    },
  })

  await prisma.candidateProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      headline: "Коммерческий директор / Head of Growth, 18 лет в B2B и B2C",
      location: "Москва",
      linkedinUrl: "https://linkedin.com/in/example-demo",
      preferredLanguages: ["ru", "en"],
      preferredFormats: ["permanent", "fractional", "advisory"],
      targetLocations: ["Москва", "Remote"],
      targetWorkModes: ["hybrid", "remote"],
      compensationMin: 600000,
      compensationMax: 900000,
      compensationCurrency: "RUB",
      preferredIndustries: ["retail", "fintech", "e-commerce"],
      preferredCompanyTypes: ["scale-up", "enterprise"],
      preferredCompanySizes: ["200-1000", "1000+"],
      preferredCompanyStages: ["growth", "mature"],
      openToLowerLevelIfScopeFits: true,
      nonNegotiables: "Не рассматриваю роли без прямого влияния на P&L.",
      currentSituation: "В активном поиске, текущий контракт завершается через 2 месяца.",
      careerChangeReason:
        "Компания меняет стратегию на органический рост без международной экспансии — ищу роль с более широким мандатом.",
    },
  })

  const commercialTrack = await prisma.careerTrack.create({
    data: {
      userId: user.id,
      title: "Commercial Director",
      alternativeTitles: ["VP Commercial", "Chief Revenue Officer"],
      employmentFormats: ["permanent", "fractional"],
      targetIndustries: ["retail", "e-commerce"],
      targetCompanyTypes: ["scale-up"],
      targetCompanyStages: ["growth"],
      targetCompanySizes: ["200-1000"],
      businessProblems: [
        "Стагнация выручки при выходе из фазы быстрого роста",
        "Разрозненные продажи и маркетинг без единой воронки",
      ],
      mustHaveSkills: ["P&L management", "GTM strategy", "team leadership"],
      valueProposition:
        "Помогаю retail- и e-commerce-компаниям на стадии роста выстроить коммерческую функцию вокруг единой воронки и вернуть двузначный рост выручки.",
      motivationStatement:
        "Ищу компанию, где можно взять полный коммерческий мандат, а не только маркетинг или только продажи.",
      active: true,
    },
  })

  const fractionalTrack = await prisma.careerTrack.create({
    data: {
      userId: user.id,
      title: "Fractional CMO",
      alternativeTitles: ["Fractional Head of Growth"],
      employmentFormats: ["fractional", "advisory"],
      targetIndustries: ["fintech", "e-commerce"],
      targetCompanyTypes: ["scale-up", "startup"],
      targetCompanyStages: ["growth", "seed"],
      targetCompanySizes: ["50-200"],
      businessProblems: ["Нет зрелой маркетинговой функции, но полноценный CMO пока не нужен"],
      mustHaveSkills: ["growth strategy", "team building", "budget ownership"],
      valueProposition:
        "Захожу на 2–3 дня в неделю как fractional CMO в компании, которым нужна стратегия и выстроенный процесс, а не ещё один исполнитель.",
      motivationStatement: "Хочу совмещать 2–3 проекта параллельно вместо одной полной ставки.",
      active: true,
    },
  })

  const experience = await prisma.experience.create({
    data: {
      userId: user.id,
      companyName: "Ритейл Групп",
      companyIndustry: "retail",
      title: "Коммерческий директор",
      employmentType: "permanent",
      startDate: new Date("2019-03-01"),
      endDate: new Date("2024-06-01"),
      location: "Москва",
      description: "Отвечала за продажи, маркетинг и e-commerce направление сети из 120 магазинов.",
      responsibilities: [
        "P&L коммерческого блока",
        "Управление командой из 45 человек (продажи, маркетинг, e-commerce)",
        "Запуск нового канала продаж",
      ],
      teamSize: 45,
      budgetDescription: "Годовой маркетинговый бюджет 180 млн ₽",
      geographies: ["Россия"],
      clientTypes: ["B2C"],
      verificationStatus: "verified",
    },
  })

  await prisma.evidence.createMany({
    data: [
      {
        userId: user.id,
        careerTrackId: commercialTrack.id,
        experienceId: experience.id,
        title: "Запуск e-commerce канала с нуля",
        situation: "У сети из 120 офлайн-магазинов не было прямого онлайн-канала продаж.",
        task: "Требовалось запустить онлайн-продажи и достичь операционной окупаемости за 12 месяцев.",
        action:
          "Сформировала кросс-функциональную команду из 8 человек, выбрала платформу, выстроила логистику совместно с операционным директором, запустила первую версию за 4 месяца.",
        result: "Канал вышел на операционную окупаемость за 9 месяцев и занял 15% от общей выручки через 2 года.",
        metricValue: 15,
        metricUnit: "% от выручки",
        metricDescription: "Доля e-commerce канала в общей выручке компании через 2 года после запуска",
        timeframe: "2020–2022",
        scaleDescription: "Сеть из 120 магазинов, региональный масштаб",
        teamSize: 8,
        industries: ["retail"],
        skills: ["e-commerce", "team building", "P&L management"],
        sourceType: "manual_entry",
        verificationStatus: "verified",
        confidenceLevel: "high",
        qualityScore: 85,
        qualityExplanation: "Есть контекст, действия, результат и метрика с понятной единицей измерения.",
      },
      {
        userId: user.id,
        careerTrackId: commercialTrack.id,
        experienceId: experience.id,
        title: "Реструктуризация коммерческой команды",
        situation: "Продажи и маркетинг работали как отдельные подразделения с конфликтующими KPI.",
        task: "Нужно было объединить функции вокруг единой воронки продаж без потери темпа продаж в переходный период.",
        action: "Провела реорганизацию, ввела сквозные метрики воронки, лично провела серию 1:1 с ключевыми руководителями.",
        result: "Цикл сделки сократился, команда сохранила показатели продаж в течение всего переходного периода.",
        metricValue: null,
        metricUnit: null,
        metricDescription: "Точная величина сокращения цикла сделки не зафиксирована — уточнить у кандидата.",
        timeframe: "2021",
        scaleDescription: "45 человек в объединённой команде",
        teamSize: 45,
        industries: ["retail"],
        skills: ["org design", "change management"],
        sourceType: "manual_entry",
        verificationStatus: "verified",
        confidenceLevel: "medium",
        qualityScore: 55,
        qualityExplanation: "Результат описан качественно, но не хватает количественной метрики.",
      },
      {
        userId: user.id,
        careerTrackId: fractionalTrack.id,
        title: "Advisory для fintech-стартапа по стратегии выхода на B2C",
        situation: "Fintech-стартап с B2B-продуктом рассматривал выход в B2C-сегмент.",
        task: "Требовалась независимая оценка рынка и рекомендации по GTM-стратегии.",
        action: "Провела серию интервью с потенциальными клиентами, построила модель unit-экономики канала, представила рекомендации совету директоров.",
        result: "Совет директоров принял решение не выходить в B2C в текущем цикле, опираясь на представленный анализ рисков.",
        timeframe: "2023, 6 недель",
        scaleDescription: "Проект на условиях advisory, 1 день в неделю",
        industries: ["fintech"],
        skills: ["market research", "unit economics", "advisory"],
        sourceType: "manual_entry",
        verificationStatus: "unverified",
        confidenceLevel: "medium",
        qualityScore: 60,
        qualityExplanation: "Личный вклад описан, но нет измеримого бизнес-результата — только избежание риска.",
      },
    ],
  })

  await prisma.skill.createMany({
    data: [
      { userId: user.id, name: "P&L management", category: "leadership", verificationStatus: "verified" },
      { userId: user.id, name: "GTM strategy", category: "commercial", verificationStatus: "verified" },
      { userId: user.id, name: "E-commerce", category: "domain", verificationStatus: "verified" },
      { userId: user.id, name: "SaaS", category: "domain", verificationStatus: "unverified" },
    ],
  })

  await prisma.resume.create({
    data: {
      userId: user.id,
      careerTrackId: commercialTrack.id,
      name: "Base — Commercial Director (RU)",
      language: "ru",
      isBase: true,
      structuredContent: {
        summary:
          "Коммерческий директор с 18-летним опытом в retail и e-commerce. Специализация — построение коммерческой функции на стадии роста.",
        experience: [],
        achievements: [],
        skills: ["P&L management", "GTM strategy", "E-commerce"],
        education: [],
        certifications: [],
        projects: [],
      },
    },
  })

  await prisma.opportunity.createMany({
    data: [
      {
        userId: user.id,
        type: "vacancy",
        companyName: "Северный Ритейл",
        title: "Коммерческий директор",
        sourceName: "manual",
        location: "Москва",
        workMode: "hybrid",
        employmentFormat: "permanent",
        compensationMin: 700000,
        compensationMax: 850000,
        compensationCurrency: "RUB",
        rawDescription:
          "Ищем коммерческого директора для сети из 80 магазинов на стадии активного роста. P&L, команда 30+ человек.",
        status: "researching",
        priority: "high",
        nextAction: "Изучить годовой отчёт компании перед откликом",
        nextActionDueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        type: "fractional",
        companyName: "GrowthLab (fintech)",
        title: "Fractional CMO",
        sourceName: "manual",
        location: "Remote",
        workMode: "remote",
        employmentFormat: "fractional",
        compensationMin: 300000,
        compensationMax: 400000,
        compensationCurrency: "RUB",
        rawDescription: "Fintech-стартап ищет fractional CMO на 2 дня в неделю для выстраивания growth-стратегии.",
        status: "saved",
        priority: "medium",
        followUpAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        type: "vacancy",
        companyName: "МедТех Инновации",
        title: "Head of Commercial",
        sourceName: "manual",
        location: "Санкт-Петербург",
        workMode: "onsite",
        employmentFormat: "permanent",
        compensationMin: 650000,
        compensationMax: 800000,
        compensationCurrency: "RUB",
        rawDescription:
          "Компания в сфере медицинского оборудования (B2B, длинный цикл продаж) ищет руководителя коммерческого блока. Обязателен опыт продаж медицинского оборудования.",
        status: "saved",
        priority: "low",
        notes: "Прямого опыта в medtech нет — реальный industry gap, требует уточнения на этапе screening.",
      },
    ],
  })

  console.log(`Seeded demo candidate ${user.email} (${user.id}) with 2 tracks, 3 evidence cards, 3 opportunities.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
