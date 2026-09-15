import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { env } from "@/lib/env"

// Server Components can't set cookies (no response to attach them to). We swallow that
// error here; session refresh in that case is handled by src/proxy.ts on the next request.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // called from a Server Component — ignore, proxy.ts refreshes the session
        }
      },
    },
  })
}
