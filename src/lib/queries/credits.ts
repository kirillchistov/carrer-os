import { prisma } from "@/lib/db/prisma"
import { logDbError } from "@/lib/db/connection"

export async function getCreditBalanceForUser(userId: string): Promise<number | null> {
  try {
    const account = await prisma.creditAccount.findUnique({
      where: { userId },
      select: { balance: true },
    })
    return account?.balance ?? null
  } catch (error) {
    logDbError(error, "query")
    return null
  }
}
