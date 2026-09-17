"use server"

import { prisma } from "@/lib/db/prisma"
import { requireCurrentUser } from "@/lib/auth/session"

export async function getMyCreditAccount() {
  const user = await requireCurrentUser()
  try {
    return await prisma.creditAccount.findUnique({ where: { userId: user.id } })
  } catch {
    return null
  }
}

export async function listMyRecentCreditTransactions(limit = 10) {
  const user = await requireCurrentUser()
  try {
    return await prisma.creditTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  } catch {
    return []
  }
}

export async function listMyAiFeedbackReports() {
  const user = await requireCurrentUser()
  try {
    return await prisma.aiFeedbackReport.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })
  } catch {
    return []
  }
}
