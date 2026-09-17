"use server"

import { requireCurrentUser } from "@/lib/auth/session"
import { track } from "@/lib/analytics/track"
import { prisma } from "@/lib/db/prisma"

export async function markOnboardingCompleted() {
  const user = await requireCurrentUser()
  await prisma.user.update({
    where: { id: user.id },
    data: { onboardingCompletedAt: new Date() },
  })
  track("onboarding_completed", user.id)
  return { ok: true as const }
}
