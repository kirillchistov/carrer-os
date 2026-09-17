import { env } from "@/lib/env"

/** Public origin of the incoming request. On Vercel, `request.url` origin can be wrong; prefer forwarded headers. */
export function resolveRequestOrigin(request: Request, nodeEnv = process.env.NODE_ENV): string {
  if (nodeEnv !== "production") {
    return new URL(request.url).origin
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  const proto = request.headers.get("x-forwarded-proto") ?? "https"
  if (host) return `${proto}://${host}`

  return env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
}
