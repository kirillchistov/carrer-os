import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"
import { SignupForm } from "@/components/auth/signup-form"
import { safeNextPath } from "@/lib/auth/safe-next"

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const params = await searchParams
  const next = params.next ? safeNextPath(params.next) : undefined

  return (
    <AuthCard
      title="Регистрация"
      description={
        <>
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-foreground underline underline-offset-4">
            Войти
          </Link>
        </>
      }
    >
      <SignupForm next={next} />
    </AuthCard>
  )
}
