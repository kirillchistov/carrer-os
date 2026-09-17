import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { env } from "@/lib/env"

/**
 * Supabase client that records cookie writes so they can be attached to a specific
 * NextResponse (including redirects). The `cookies()` store from `next/headers`
 * often drops Set-Cookie on 3xx responses on Vercel.
 */
export function createSupabaseCookieClient(request: NextRequest) {
  const pending: { name: string; value: string; options?: Parameters<NextResponse["cookies"]["set"]>[2] }[] = []

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        pending.push(...cookiesToSet)
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
      },
    },
  })

  function applyCookies(response: NextResponse) {
    for (const { name, value, options } of pending) {
      response.cookies.set(name, value, options)
    }
    return response
  }

  return { supabase, applyCookies }
}
