import { cookies } from "next/headers"
import { cache } from "react"
import { redirect } from "next/navigation"
import type { User } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { ProfileProvisioningError } from "@/lib/errors"
import { logAuthEvent } from "@/lib/auth/log"
import { canImpersonate, IMPERSONATE_COOKIE, isUuid } from "@/lib/auth/impersonation"

function authErrorReason(error: unknown): string {
  if (error && typeof error === "object") {
    const e = error as { status?: number; code?: string; name?: string }
    if (e.status === 429 || e.code === "over_request_rate_limit") return "rate_limited"
    if (typeof e.code === "string" && e.code.length > 0 && e.code.length < 64) return e.code
    if (typeof e.status === "number") return `auth_${e.status}`
    if (typeof e.name === "string" && e.name.length > 0) return e.name
  }
  return "unknown"
}

export type SessionContext = {
  actor: User
  user: User
  impersonating: boolean
}

export const getSessionContext = cache(async (): Promise<SessionContext | null> => {
  const supabase = await createSupabaseServerClient()
  try {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      logAuthEvent("session", { ok: false, reason: authErrorReason(error) })
      return null
    }
    if (!authUser) return null

    const actor = await ensureAppUser(authUser)
    const jar = await cookies()
    const targetId = jar.get(IMPERSONATE_COOKIE)?.value
    if (targetId && isUuid(targetId) && actor.role === "admin") {
      const target = await prisma.user.findUnique({ where: { id: targetId } })
      if (canImpersonate(actor, target) && target) {
        return { actor, user: target, impersonating: true }
      }
    }

    return { actor, user: actor, impersonating: false }
  } catch (error) {
    if (error instanceof ProfileProvisioningError) throw error
    logAuthEvent("session", { ok: false, reason: authErrorReason(error) })
    return null
  }
})

export async function getCurrentUser(): Promise<User | null> {
  const ctx = await getSessionContext()
  return ctx?.user ?? null
}

export async function requireSession(): Promise<SessionContext> {
  let ctx: SessionContext | null
  try {
    ctx = await getSessionContext()
  } catch (error) {
    if (error instanceof ProfileProvisioningError) {
      redirect("/account-unavailable")
    }
    throw error
  }
  if (!ctx) redirect("/login")
  return ctx
}

export async function requireCurrentUser(): Promise<User> {
  return (await requireSession()).user
}

export async function requireAdmin(): Promise<SessionContext> {
  const ctx = await requireSession()
  if (ctx.actor.role !== "admin") redirect("/dashboard")
  return ctx
}
