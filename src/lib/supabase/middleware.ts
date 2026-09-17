import { NextResponse, type NextRequest } from "next/server"
import { isProtectedPath } from "@/lib/auth/paths"
import { createSupabaseCookieClient } from "@/lib/supabase/cookie-client"

export { isProtectedPath }

export async function updateSupabaseSession(request: NextRequest) {
  const { supabase, applyCookies } = createSupabaseCookieClient(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isProtectedPath(request.nextUrl.pathname) && !user) {
    const redirectUrl = request.nextUrl.clone()
    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`
    redirectUrl.pathname = "/login"
    redirectUrl.search = ""
    redirectUrl.searchParams.set("next", nextPath)
    return NextResponse.redirect(redirectUrl)
  }

  return applyCookies(NextResponse.next({ request }))
}
