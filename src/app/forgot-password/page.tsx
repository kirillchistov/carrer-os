import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const expired = params.error === "expired"

  return (
    <AuthCard
      title="Сброс пароля"
      description={
        <>
          Вспомнили пароль?{" "}
          <Link href="/login" className="text-foreground underline underline-offset-4">
            Войти
          </Link>
        </>
      }
    >
      {expired ? (
        <p className="mb-4 text-sm text-destructive">Ссылка устарела. Запросите новую.</p>
      ) : null}
      <ForgotPasswordForm />
    </AuthCard>
  )
}
