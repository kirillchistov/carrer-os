import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseCookieClient } from "@/lib/supabase/cookie-client"
import { resolveRequestOrigin } from "@/lib/auth/origin"
import { safeNextPath } from "@/lib/auth/safe-next"
import { logAuthEvent } from "@/lib/auth/log"

export async function GET(request: NextRequest) {
  const origin = resolveRequestOrigin(request)
  const code = request.nextUrl.searchParams.get("code")
  const next = safeNextPath(request.nextUrl.searchParams.get("next"))

  if (!code) {
    logAuthEvent("callback", { ok: false, reason: "missing_code" })
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const { supabase, applyCookies } = createSupabaseCookieClient(request)
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    logAuthEvent("callback", { ok: false, reason: error.code ?? "exchange_failed" })
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  logAuthEvent("callback", { ok: true })
  return applyCookies(NextResponse.redirect(`${origin}${next}`))
}
