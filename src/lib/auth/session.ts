import { redirect } from "next/navigation"
import type { User } from "@prisma/client"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { ProfileProvisioningError } from "@/lib/errors"

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  return ensureAppUser(authUser)
}

export async function requireCurrentUser(): Promise<User> {
  try {
    const user = await getCurrentUser()
    if (!user) redirect("/login")
    return user
  } catch (error) {
    if (error instanceof ProfileProvisioningError) {
      redirect("/account-unavailable")
    }
    throw error
  }
}
