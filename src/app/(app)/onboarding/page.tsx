import { redirect } from "next/navigation"
import { requireCurrentUser } from "@/lib/auth/session"
import { getMyProfile } from "@/lib/actions/profile"
import { listMyExperiences } from "@/lib/actions/experience"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { toProfileFormValues } from "@/lib/validation/profile"

export default async function OnboardingPage() {
  const user = await requireCurrentUser()
  if (user.onboardingCompletedAt) redirect("/dashboard")

  const [profile, experiences] = await Promise.all([getMyProfile(), listMyExperiences()])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Онбординг</h1>
        <p className="text-sm text-muted-foreground">
          Три коротких шага: профиль, импорт опыта, первый карьерный трек.
        </p>
      </div>
      <OnboardingWizard initialProfileValues={toProfileFormValues(profile)} initialExperiences={experiences} />
    </div>
  )
}
