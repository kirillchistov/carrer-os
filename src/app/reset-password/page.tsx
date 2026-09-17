import { redirect } from "next/navigation"
import { AuthCard } from "@/components/auth/auth-card"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function ResetPasswordPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/forgot-password?error=expired")

  return (
    <AuthCard title="Новый пароль" description="Придумайте пароль для входа — минимум 8 символов.">
      <ResetPasswordForm />
    </AuthCard>
  )
}
