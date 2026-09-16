"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteInterview } from "@/lib/actions/interviews"

export function DeleteInterviewButton({ interviewId }: { interviewId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      disabled={pending}
      onClick={() => {
        if (confirm("Удалить эту запись об интервью?")) {
          startTransition(async () => {
            const result = await deleteInterview(interviewId)
            router.push(`/opportunities/${result.opportunityId}`)
          })
        }
      }}
    >
      <Trash2 className="size-4" />
      Удалить
    </Button>
  )
}
