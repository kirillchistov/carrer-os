"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { InterviewForm } from "@/components/interviews/interview-form"
import { createInterview } from "@/lib/actions/interviews"
import { interviewFormDefaults } from "@/lib/validation/interview"

export function AddInterviewDialog({ opportunityId }: { opportunityId: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Plus className="size-4" />
        Записать интервью
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Новая запись об интервью</DialogTitle>
        </DialogHeader>
        <InterviewForm
          defaultValues={interviewFormDefaults}
          submitLabel="Добавить"
          onSubmit={async (values) => {
            await createInterview(opportunityId, values)
            setOpen(false)
            router.refresh()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
