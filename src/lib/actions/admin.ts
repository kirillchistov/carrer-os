"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAdmin } from "@/lib/auth/session"
import { canImpersonate, IMPERSONATE_COOKIE, isUuid } from "@/lib/auth/impersonation"
import { logAuthEvent } from "@/lib/auth/log"
import { revalidatePath } from "next/cache"

const grantSchema = z.object({
  userId: z.string().uuid(),
  amount: z.coerce.number().int().min(1).max(500),
})

export async function listAdminUsers() {
  await requireAdmin()
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      creditAccount: { select: { balance: true } },
    },
  })
}

export async function grantCreditsToUser(formData: FormData): Promise<{ error: string | null }> {
  await requireAdmin()
  const parsed = grantSchema.safeParse({
    userId: formData.get("userId"),
    amount: formData.get("amount"),
  })
  if (!parsed.success) {
    return { error: "Укажите пользователя и сумму от 1 до 500." }
  }

  try {
    await prisma.creditAccount.upsert({
      where: { userId: parsed.data.userId },
      update: { balance: { increment: parsed.data.amount } },
      create: { userId: parsed.data.userId, balance: parsed.data.amount },
    })
    await prisma.creditTransaction.create({
      data: {
        userId: parsed.data.userId,
        amount: parsed.data.amount,
        reason: "manual_grant",
      },
    })
  } catch {
    return { error: "Не удалось начислить кредиты." }
  }

  revalidatePath("/admin")
  return { error: null }
}

export async function startImpersonation(formData: FormData) {
  const { actor } = await requireAdmin()
  const userId = String(formData.get("userId") ?? "")
  if (!isUuid(userId)) redirect("/admin")
  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!canImpersonate(actor, target)) {
    logAuthEvent("impersonate", { ok: false, reason: "forbidden" })
    redirect("/admin")
  }

  const jar = await cookies()
  jar.set(IMPERSONATE_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  })
  logAuthEvent("impersonate", { ok: true, reason: "start" })
  redirect("/dashboard")
}

export async function stopImpersonation() {
  await requireAdmin()
  const jar = await cookies()
  jar.delete(IMPERSONATE_COOKIE)
  logAuthEvent("impersonate", { ok: true, reason: "stop" })
  redirect("/admin")
}
