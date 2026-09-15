"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteOpportunity } from "@/lib/actions/opportunities"

export function DeleteOpportunityButton({ opportunityId }: { opportunityId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      disabled={pending}
      onClick={() => {
        if (confirm("Удалить эту возможность?")) {
          startTransition(async () => {
            await deleteOpportunity(opportunityId)
            router.push("/opportunities")
          })
        }
      }}
    >
      <Trash2 className="size-4" />
      Удалить
    </Button>
  )
}
