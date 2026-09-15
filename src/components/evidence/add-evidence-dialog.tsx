"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EvidenceForm } from "@/components/evidence/evidence-form"
import { createEvidence } from "@/lib/actions/evidence"
import { evidenceFormDefaults } from "@/lib/validation/evidence"

type Option = { id: string; label: string }

export function AddEvidenceDialog({
  careerTrackOptions,
  experienceOptions,
}: {
  careerTrackOptions: Option[]
  experienceOptions: Option[]
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Добавить доказательство
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Новое доказательство</DialogTitle>
        </DialogHeader>
        <EvidenceForm
          defaultValues={evidenceFormDefaults}
          careerTrackOptions={careerTrackOptions}
          experienceOptions={experienceOptions}
          submitLabel="Добавить"
          onSubmit={async (values) => {
            await createEvidence(values)
            setOpen(false)
            router.refresh()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
