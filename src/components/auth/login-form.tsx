"use client"

import { useActionState, useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signInWithPassword, sendMagicLink, type AuthActionState } from "@/lib/actions/auth"

const initialState: AuthActionState = { error: null }

export function LoginForm({ next }: { next?: string }) {
  const [passwordState, passwordAction, passwordPending] = useActionState(
    signInWithPassword,
    initialState
  )
  const [magicError, setMagicError] = useState<string | null>(null)
  const [magicSent, setMagicSent] = useState(false)
  const [magicPending, startMagicTransition] = useTransition()

  return (
    <Tabs defaultValue="password" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="password">Пароль</TabsTrigger>
        <TabsTrigger value="magic-link">Ссылка на email</TabsTrigger>
      </TabsList>

      <TabsContent value="password" className="space-y-4 pt-4">
        <form action={passwordAction} className="space-y-4">
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {passwordState.error && <p className="text-sm text-destructive">{passwordState.error}</p>}
          <Button type="submit" className="w-full" disabled={passwordPending}>
            {passwordPending ? "Входим..." : "Войти"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/forgot-password" className="underline underline-offset-4">
              Забыли пароль?
            </Link>
          </p>
        </form>
      </TabsContent>

      <TabsContent value="magic-link" className="space-y-4 pt-4">
        {magicSent ? (
          <p className="text-sm text-muted-foreground">
            Мы отправили ссылку для входа на указанный email. Проверьте почту.
          </p>
        ) : (
          <form
            action={(formData: FormData) => {
              setMagicError(null)
              startMagicTransition(async () => {
                const result = await sendMagicLink(initialState, formData)
                if (result.error) {
                  setMagicError(result.error)
                } else {
                  setMagicSent(true)
                }
              })
            }}
            className="space-y-4"
          >
            {next ? <input type="hidden" name="next" value={next} /> : null}
            <div className="space-y-2">
              <Label htmlFor="magic-email">Email</Label>
              <Input id="magic-email" name="email" type="email" autoComplete="email" required />
            </div>
            {magicError && <p className="text-sm text-destructive">{magicError}</p>}
            <Button type="submit" className="w-full" variant="secondary" disabled={magicPending}>
              {magicPending ? "Отправляем..." : "Отправить ссылку для входа"}
            </Button>
          </form>
        )}
      </TabsContent>
    </Tabs>
  )
}
