"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { requireSession, requireCurrentUser } from "@/lib/auth/session"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { env } from "@/lib/env"
import { logAuthEvent } from "@/lib/auth/log"

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

export async function deleteMyAccount(): Promise<{ error: string | null }> {
  const ctx = await requireSession()
  if (ctx.impersonating) {
    return { error: "Нельзя удалить аккаунт, пока вы смотрите его как админ." }
  }
  const user = ctx.user
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "Удаление из интерфейса недоступно. Напишите нам с вашего email." }
  }

  const admin = createSupabaseAdminClient()
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) {
    logAuthEvent("account_delete", { ok: false, reason: error.code ?? "delete_failed" })
    return { error: "Не удалось удалить аккаунт. Попробуйте позже." }
  }

  logAuthEvent("account_delete", { ok: true })
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect("/")
}
