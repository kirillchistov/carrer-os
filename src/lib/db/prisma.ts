import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { logDbError, prismaPoolConfig } from "@/lib/db/connection"

declare global {
  var prismaGlobal: PrismaClient | undefined
}

function createPrismaClient() {
  const adapter = new PrismaPg(prismaPoolConfig(process.env.DATABASE_URL), {
    schema: "career_os",
    onPoolError: (err) => logDbError(err, "pool"),
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalThis.prismaGlobal ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma
}
