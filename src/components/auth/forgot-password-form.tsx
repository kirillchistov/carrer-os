"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sendPasswordReset, type AuthActionState } from "@/lib/actions/auth"

const initialState: AuthActionState = { error: null }

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(sendPasswordReset, initialState)

  if (state.checkEmail) {
    return (
      <p className="text-sm text-muted-foreground">
        Если аккаунт с таким email есть, мы отправили ссылку для сброса пароля. Проверьте почту.
      </p>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Отправляем..." : "Отправить ссылку"}
      </Button>
    </form>
  )
}
