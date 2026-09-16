import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const user = await prisma.user.findFirst({ where: { email: "demo@career-evidence-os.app" } })
const account = await prisma.creditAccount.findFirst({ where: { userId: user.id } })
const txns = await prisma.creditTransaction.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: "desc" },
  take: 4,
})
console.log("balance:", account.balance)
console.log(txns.map(t => ({ amount: t.amount, reason: t.reason, createdAt: t.createdAt })))

const applications = await prisma.application.findMany({ where: { userId: user.id } })
console.log("applications:", applications.length)

const aiRuns = await prisma.aiRun.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, taskType: true, status: true, errorMessage: true } })
console.log("recent AI runs:", aiRuns)

await prisma.$disconnect()
