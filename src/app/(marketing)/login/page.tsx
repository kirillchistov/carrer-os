import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"
import { LoginForm } from "@/components/auth/login-form"
import { safeNextPath } from "@/lib/auth/safe-next"

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed:
    "Не удалось войти по ссылке. Запросите новое письмо или войдите с паролем.",
  expired: "Ссылка устарела. Запросите новую.",
}

function withNext(href: string, next?: string) {
  if (!next) return href
  const url = new URL(href, "https://local.invalid")
  url.searchParams.set("next", next)
  return `${url.pathname}${url.search}`
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  const next = params.next ? safeNextPath(params.next) : undefined
  const errorMessage = params.error ? LOGIN_ERROR_MESSAGES[params.error] : undefined

  return (
    <AuthCard
      title="Вход в Career Evidence OS"
      description={
        <>
          Ещё нет аккаунта?{" "}
          <Link href={withNext("/signup", next)} className="text-foreground underline underline-offset-4">
            Зарегистрироваться
          </Link>
        </>
      }
    >
      {errorMessage ? <p className="mb-4 text-sm text-destructive">{errorMessage}</p> : null}
      <LoginForm next={next} />
    </AuthCard>
  )
}
