"use client"

import { useState, useTransition } from "react"
import { Flag } from "lucide-react"
import type { AiFeedbackTargetType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { fileAiFeedback } from "@/lib/actions/ai-feedback"
import { toast } from "sonner"

export function AiFeedbackButton({
  aiRunId,
  targetType,
  targetId,
  className,
}: {
  aiRunId: string | null
  targetType: AiFeedbackTargetType
  targetId?: string | null
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [comment, setComment] = useState("")
  const [pending, startTransition] = useTransition()

  function submit() {
    startTransition(async () => {
      await fileAiFeedback({
        aiRunId,
        targetType,
        targetId: targetId ?? null,
        comment: comment.trim() || null,
      })
      toast.success("Спасибо, мы получили сообщение об ошибке.")
      setOpen(false)
      setComment("")
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" className={className} />}>
        <Flag className="size-3.5" />
        Сообщить об ошибке в разборе
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Сообщить об ошибке в разборе</DialogTitle>
          <DialogDescription>
            Опишите, что AI разобрал неверно. Это поможет улучшить извлечение данных —
            запись останется в истории и не изменит уже сохранённые данные автоматически.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Например: неверно определена компания или пропущена метрика"
          rows={4}
        />
        <DialogFooter>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Отправляем..." : "Отправить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
