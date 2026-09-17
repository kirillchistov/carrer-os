export const DEFAULT_AFTER_AUTH_PATH = "/dashboard"

const BLOCKED_EXACT = ["/login", "/signup", "/forgot-password", "/account-unavailable"]

function isBlockedPathname(pathname: string): boolean {
  if (pathname === "/auth" || pathname.startsWith("/auth/")) return true
  return BLOCKED_EXACT.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

/**
 * Only allow in-app relative paths. Rejects protocol-relative URLs, other origins,
 * and auth pages (so a failed login cannot loop back onto itself).
 */
export function safeNextPath(value: unknown, fallback = DEFAULT_AFTER_AUTH_PATH): string {
  if (typeof value !== "string") return fallback
  const trimmed = value.trim()
  if (!trimmed.startsWith("/")) return fallback
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return fallback
  if (trimmed.includes("://")) return fallback

  const pathname = trimmed.split("?")[0] ?? trimmed
  if (isBlockedPathname(pathname)) return fallback
  return trimmed
}

export function authCallbackUrl(appUrl: string, next?: unknown): string {
  const url = new URL("/auth/callback", appUrl)
  url.searchParams.set("next", safeNextPath(next))
  return url.toString()
}
