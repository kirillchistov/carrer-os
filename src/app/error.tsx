"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
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
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
      <h1 className="font-heading text-2xl font-semibold">Что-то пошло не так</h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        Страница не загрузилась. Попробуйте ещё раз — если ошибка повторится, напишите нам.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Повторить</Button>
        <Button nativeButton={false} render={<Link href="/" />} variant="outline">
          На главную
        </Button>
      </div>
    </main>
  )
}
