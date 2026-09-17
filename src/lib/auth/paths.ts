/** Routes that require a Supabase session. Keep in sync with `src/app/(app)`. */
export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/profile",
  "/evidence",
  "/tracks",
  "/resumes",
  "/opportunities",
  "/pipeline",
  "/settings",
  "/quick-tailor",
  "/interviews",
  "/resources",
] as const

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}
