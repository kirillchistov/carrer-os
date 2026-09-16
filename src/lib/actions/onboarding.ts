"use server"

import { requireCurrentUser } from "@/lib/auth/session"
import { track } from "@/lib/analytics/track"

export async function markOnboardingCompleted() {
  const user = await requireCurrentUser()
  track("onboarding_completed", user.id)
  return { ok: true as const }
}
