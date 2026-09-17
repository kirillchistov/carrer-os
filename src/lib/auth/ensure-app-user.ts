import type { User } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"
import { ProfileProvisioningError } from "@/lib/errors"
import { logAuthEvent } from "@/lib/auth/log"

const SIGNUP_CREDIT_BALANCE = 20

/**
 * Makes sure `auth.users` has a matching `career_os.users` (+ starter credits).
 * The DB trigger should do this; this is a safe fallback for a missed SQL apply
 * or a race on first request after signup.
 */
export async function ensureAppUser(authUser: { id: string; email?: string | null }): Promise<User> {
  const existing = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: { creditAccount: true },
  })

  if (existing) {
    if (!existing.creditAccount) {
      await prisma.creditAccount.create({
        data: { userId: existing.id, balance: SIGNUP_CREDIT_BALANCE },
      }).catch(() => {
        // Unique race with the trigger — ignore.
      })
    }
    return existing
  }

  const email = authUser.email?.trim()
  if (!email) {
    logAuthEvent("identity_backfill", { ok: false, reason: "missing_email" })
    throw new ProfileProvisioningError("У аккаунта нет email — профиль создать нельзя.")
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { id: authUser.id, email, locale: "ru" },
      })
      await tx.creditAccount.create({
        data: { userId: created.id, balance: SIGNUP_CREDIT_BALANCE },
      })
      return created
    })
    logAuthEvent("identity_backfill", { ok: true, reason: "created" })
    return user
  } catch {
    const raced = await prisma.user.findUnique({ where: { id: authUser.id } })
    if (raced) return raced
    logAuthEvent("identity_backfill", { ok: false, reason: "create_failed" })
    throw new ProfileProvisioningError()
  }
}
