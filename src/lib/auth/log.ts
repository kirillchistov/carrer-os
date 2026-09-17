/**
 * Structured auth logs: event name + enums/booleans only. Never pass email, tokens,
 * or redirect URLs that might contain secrets.
 */
export type AuthLogEvent =
  | "login_password"
  | "signup"
  | "magic_link"
  | "callback"
  | "password_reset_request"
  | "password_update"
  | "sign_out"
  | "identity_backfill"
  | "session"
  | "account_delete"

export function logAuthEvent(
  event: AuthLogEvent,
  details: { ok: boolean; reason?: string }
) {
  console.log(
    JSON.stringify({
      type: "auth_event",
      event,
      ok: details.ok,
      reason: details.reason ?? null,
      timestamp: new Date().toISOString(),
    })
  )
}
