import type { UserRole } from "@prisma/client"

export const IMPERSONATE_COOKIE = "ceo_impersonate"
export const ADMIN_EMAIL = "admin@career-evidence-os.app"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(value: string): boolean {
  return UUID_RE.test(value)
}

export function canImpersonate(
  actor: { id: string; role: UserRole },
  target: { id: string; role: UserRole } | null
): boolean {
  return Boolean(target && actor.role === "admin" && target.role !== "admin" && target.id !== actor.id)
}
