import Link from "next/link"
import { getMyProfile } from "@/lib/actions/profile"
import { ProfileForm } from "@/components/profile/profile-form"
import { toProfileFormValues } from "@/lib/validation/profile"
import { Button } from "@/components/ui/button"

export default async function ProfilePage() {
  const profile = await getMyProfile()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground">
            Основные данные, предпочтения по формату работы и non-negotiables.
          </p>
        </div>
        <Button render={<Link href="/profile/experience" />} variant="outline" nativeButton={false}>
          Опыт работы
        </Button>
      </div>
      <ProfileForm initialValues={toProfileFormValues(profile)} />
    </div>
  )
}
