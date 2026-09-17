import { cache } from "react"
import { redirect } from "next/navigation"
import type { User } from "@prisma/client"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { ProfileProvisioningError } from "@/lib/errors"
import { logAuthEvent } from "@/lib/auth/log"

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

export const getCurrentUser = cache(async (): Promise<User | null> => {
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

    return ensureAppUser(authUser)
  } catch (error) {
    if (error instanceof ProfileProvisioningError) throw error
    logAuthEvent("session", { ok: false, reason: authErrorReason(error) })
    return null
  }
})

export async function requireCurrentUser(): Promise<User> {
  let user: User | null
  try {
    user = await getCurrentUser()
  } catch (error) {
    if (error instanceof ProfileProvisioningError) {
      redirect("/account-unavailable")
    }
    throw error
  }
  if (!user) redirect("/login")
  return user
}
