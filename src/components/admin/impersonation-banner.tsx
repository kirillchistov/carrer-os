"use client"

import { stopImpersonation } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"

export function ImpersonationBanner({ actorEmail, targetEmail }: { actorEmail: string; targetEmail: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm md:px-8">
      <p>
        Вы как <span className="font-medium">{actorEmail}</span> смотрите аккаунт{" "}
        <span className="font-medium">{targetEmail}</span>. Записи читаются и пишутся от его имени.
      </p>
      <form action={stopImpersonation}>
        <Button type="submit" size="sm" variant="outline">
          Вернуться в админку
        </Button>
      </form>
    </div>
  )
}
