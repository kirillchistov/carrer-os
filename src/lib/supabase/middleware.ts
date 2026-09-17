import { NextResponse, type NextRequest } from "next/server"
import { isProtectedPath } from "@/lib/auth/paths"
import { createSupabaseCookieClient } from "@/lib/supabase/cookie-client"
import { logAuthEvent } from "@/lib/auth/log"

export { isProtectedPath }

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

export async function updateSupabaseSession(request: NextRequest) {
  const { supabase, applyCookies } = createSupabaseCookieClient(request)
  let user: { id: string } | null = null

  try {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser()
    if (error) {
      logAuthEvent("session", { ok: false, reason: authErrorReason(error) })
    } else {
      user = authUser
    }
  } catch (error) {
    logAuthEvent("session", { ok: false, reason: authErrorReason(error) })
  }

  if (isProtectedPath(request.nextUrl.pathname) && !user) {
    const redirectUrl = request.nextUrl.clone()
    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`
    redirectUrl.pathname = "/login"
    redirectUrl.search = ""
    redirectUrl.searchParams.set("next", nextPath)
    return applyCookies(NextResponse.redirect(redirectUrl))
  }

  return applyCookies(NextResponse.next({ request }))
}
