"use server"

import { prisma } from "@/lib/db/prisma"
import { requireCurrentUser } from "@/lib/auth/session"

export async function getMyCreditAccount() {
  const user = await requireCurrentUser()
  return prisma.creditAccount.findUnique({ where: { userId: user.id } })
}

export async function listMyRecentCreditTransactions(limit = 10) {
  const user = await requireCurrentUser()
  return prisma.creditTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function listMyAiFeedbackReports() {
  const user = await requireCurrentUser()
  return prisma.aiFeedbackReport.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })
}
