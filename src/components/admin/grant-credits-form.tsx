"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { grantCreditsToUser } from "@/lib/actions/admin"

export function GrantCreditsForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        const data = new FormData(form)
        setPending(true)
        setError(null)
        void grantCreditsToUser(data).then((result) => {
          setPending(false)
          if (result.error) setError(result.error)
          else {
            form.reset()
            router.refresh()
          }
        })
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <Input name="amount" type="number" min={1} max={500} defaultValue={20} className="w-20" aria-label="Кредиты" />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        Начислить
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </form>
  )
}
