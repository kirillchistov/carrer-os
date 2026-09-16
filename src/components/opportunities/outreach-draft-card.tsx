"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import type { Application } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AiFeedbackButton } from "@/components/ai/ai-feedback-button"
import { generateOutreachDraft, updateMessageFinal } from "@/lib/actions/outreach"

export function OutreachDraftCard({ opportunityId, initialApplication }: { opportunityId: string; initialApplication: Application | null }) {
  const router = useRouter()
  const application = initialApplication
  // Remounted (fresh useState) whenever the parent renders this with a different
  // `key={application?.id}` — i.e. exactly when a new Application row exists to sync
  // from. Ordinary re-renders under the same id (e.g. after saving) keep local edits.
  const [draftText, setDraftText] = useState(initialApplication?.messageFinal ?? initialApplication?.messageDraft ?? "")
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleGenerate() {
    setError(null)
    startTransition(async () => {
      const result = await generateOutreachDraft(opportunityId)
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.refresh()
    })
  }

  function handleSave() {
    if (!application) return
    startTransition(async () => {
      await updateMessageFinal(application.id, draftText)
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Черновик сообщения</CardTitle>
        <CardDescription>
          Короткое сообщение для рекрутера или сопроводительное письмо — только на основе
          подтверждённых фактов.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {application ? (
          <>
            <Textarea value={draftText} onChange={(e) => setDraftText(e.target.value)} rows={8} />
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={handleSave} disabled={pending}>
                Сохранить правки
              </Button>
              <Button size="sm" variant="outline" onClick={handleGenerate} disabled={pending}>
                <Sparkles className="size-3.5" />
                Сгенерировать заново
              </Button>
              <AiFeedbackButton aiRunId={null} targetType="ai_run" targetId={application.id} />
            </div>
          </>
        ) : (
          <Button onClick={handleGenerate} disabled={pending}>
            <Sparkles className="size-4" />
            {pending ? "Готовим черновик..." : "Сгенерировать черновик"}
          </Button>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
