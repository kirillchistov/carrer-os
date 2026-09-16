"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { regenerateResumeProposals } from "@/lib/actions/resume-proposals"

export function RegenerateProposalsCard({ resumeVersionId }: { resumeVersionId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleGenerate() {
    setError(null)
    startTransition(async () => {
      const result = await regenerateResumeProposals(resumeVersionId)
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Предложений пока нет</CardTitle>
        <CardDescription>
          Версия резюме создана, но AI ещё не предложил изменения — попробуйте ещё раз.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button onClick={handleGenerate} disabled={pending} className="w-fit">
          <Sparkles className="size-4" />
          {pending ? "Готовим предложения..." : "Получить предложения"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
