import { redirect } from "next/navigation"
import type { User } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { UnauthorizedError } from "@/lib/errors"

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  const user = await prisma.user.findUnique({ where: { id: authUser.id } })
  if (!user) {
    // The `on_auth_user_created` DB trigger mirrors every new Supabase auth user into
    // public.users (see supabase/migrations). Reaching here means that trigger hasn't
    // run — never paper over it by inventing the row from the app layer.
    throw new UnauthorizedError(
      "Профиль пользователя не найден в базе данных. Проверьте, что миграция auth-триггера применена."
    )
  }
  return user
}

export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return user
}
