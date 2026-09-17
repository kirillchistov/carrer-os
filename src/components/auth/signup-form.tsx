"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUpWithPassword, type AuthActionState } from "@/lib/actions/auth"

const initialState: AuthActionState = { error: null }

export function SignupForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(signUpWithPassword, initialState)

  if (state.checkEmail) {
    return (
      <p className="text-sm text-muted-foreground">
        Мы отправили письмо для подтверждения. Откройте ссылку из почты, чтобы войти — после
        этого можно перейти к работе в сервисе.
      </p>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        <p className="text-xs text-muted-foreground">Минимум 8 символов</p>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Создаём аккаунт..." : "Создать аккаунт"}
      </Button>
    </form>
  )
}
