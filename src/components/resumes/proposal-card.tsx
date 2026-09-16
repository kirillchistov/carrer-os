"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { ResumeChangeProposal } from "@prisma/client"
import { Check, Pencil, X } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AiFeedbackButton } from "@/components/ai/ai-feedback-button"
import { resolveProposal } from "@/lib/actions/resume-proposals"
import { sectionLabel } from "@/lib/resumes/section-label"
import type { ResumeContent } from "@/lib/validation/resume"

const CHANGE_TYPE_LABELS: Record<string, string> = {
  add: "Добавить",
  remove: "Убрать",
  rewrite: "Переформулировать",
  reorder: "Переупорядочить",
}

export function ProposalCard({
  proposal,
  content,
  evidenceTitles,
}: {
  proposal: ResumeChangeProposal
  content: ResumeContent | null
  evidenceTitles: Map<string, string>
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(proposal.proposedText)
  const [pending, startTransition] = useTransition()

  const isPending = proposal.status === "proposed"

  function act(action: "accept" | "reject", editedText?: string) {
    startTransition(async () => {
      await resolveProposal(proposal.id, action, editedText)
      setEditing(false)
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{sectionLabel(proposal.section, content)}</p>
          <Badge variant="outline" className="text-xs">
            {CHANGE_TYPE_LABELS[proposal.changeType] ?? proposal.changeType}
          </Badge>
        </div>
        {!isPending && (
          <Badge variant="secondary" className="text-xs">
            {proposal.status === "accepted" && "Принято"}
            {proposal.status === "edited" && "Принято с правками"}
            {proposal.status === "rejected" && "Отклонено"}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {proposal.originalText && (
          <p className="text-sm text-muted-foreground line-through decoration-destructive/50">
            {proposal.originalText}
          </p>
        )}
        {editing ? (
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} />
        ) : (
          <p className="text-sm">{proposal.finalText ?? proposal.proposedText}</p>
        )}
        <p className="text-xs text-muted-foreground">{proposal.rationale}</p>
        {Array.isArray(proposal.evidenceIds) && proposal.evidenceIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(proposal.evidenceIds as string[]).map((id) => (
              <Badge key={id} variant="outline" className="text-xs">
                {evidenceTitles.get(id) ?? id}
              </Badge>
            ))}
          </div>
        )}

        {isPending && (
          <div className="flex flex-wrap items-center gap-2">
            {editing ? (
              <>
                <Button size="sm" disabled={pending} onClick={() => act("accept", draft)}>
                  <Check className="size-3.5" />
                  Принять с правками
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  Отмена
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" disabled={pending} onClick={() => act("accept")}>
                  <Check className="size-3.5" />
                  Принять
                </Button>
                <Button size="sm" variant="outline" disabled={pending} onClick={() => setEditing(true)}>
                  <Pencil className="size-3.5" />
                  Редактировать
                </Button>
                <Button size="sm" variant="ghost" disabled={pending} onClick={() => act("reject")}>
                  <X className="size-3.5" />
                  Отклонить
                </Button>
              </>
            )}
            <AiFeedbackButton aiRunId={proposal.aiRunId} targetType="resume_change_proposal" targetId={proposal.id} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
