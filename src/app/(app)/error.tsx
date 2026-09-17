"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AppErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        type: "app_error",
        name: error.name,
        digest: error.digest ?? null,
        timestamp: new Date().toISOString(),
      })
    )
  }, [error])

  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Не удалось загрузить раздел</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Попробуйте обновить страницу. Если ошибка повторится, вернитесь на дашборд.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Повторить</Button>
        <Button nativeButton={false} render={<Link href="/dashboard" />} variant="outline">
          На дашборд
        </Button>
      </div>
    </div>
  )
}
