"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteMyAccount } from "@/lib/actions/account"

export function DeleteAccountForm({ email }: { email: string }) {
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const matches = confirm.trim().toLowerCase() === email.toLowerCase()

  return (
    <form
      className="flex max-w-sm flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (!matches) return
        setError(null)
        startTransition(async () => {
          const result = await deleteMyAccount()
          if (result?.error) setError(result.error)
        })
      }}
    >
      <Label htmlFor="delete-confirm">Чтобы удалить аккаунт, введите ваш email</Label>
      <Input
        id="delete-confirm"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        autoComplete="off"
        placeholder={email}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" variant="destructive" disabled={!matches || pending}>
        {pending ? "Удаляем..." : "Удалить аккаунт"}
      </Button>
    </form>
  )
}
