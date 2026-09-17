import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"
import { SignupForm } from "@/components/auth/signup-form"
import { safeNextPath } from "@/lib/auth/safe-next"

function withNext(href: string, next?: string) {
  if (!next) return href
  const url = new URL(href, "https://local.invalid")
  url.searchParams.set("next", next)
  return `${url.pathname}${url.search}`
}

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
          <Link href={withNext("/login", next)} className="text-foreground underline underline-offset-4">
            Войти
          </Link>
        </>
      }
    >
      <SignupForm next={next} />
    </AuthCard>
  )
}
