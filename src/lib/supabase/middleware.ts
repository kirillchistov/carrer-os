import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { env } from "@/lib/env"

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/profile",
  "/evidence",
  "/tracks",
  "/resumes",
  "/opportunities",
  "/pipeline",
  "/settings",
]

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isProtectedPath(request.nextUrl.pathname) && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("next", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
