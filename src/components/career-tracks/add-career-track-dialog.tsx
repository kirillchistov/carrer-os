"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CareerTrackForm } from "@/components/career-tracks/career-track-form"
import { createCareerTrack } from "@/lib/actions/career-tracks"
import { careerTrackFormDefaults } from "@/lib/validation/career-track"

export function AddCareerTrackDialog({ disabled }: { disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button disabled={disabled} />}>
        <Plus className="size-4" />
        Новый трек
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Новый карьерный трек</DialogTitle>
        </DialogHeader>
        <CareerTrackForm
          defaultValues={careerTrackFormDefaults}
          submitLabel="Создать"
          onSubmit={async (values) => {
            try {
              await createCareerTrack(values)
              setOpen(false)
              router.refresh()
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Не удалось создать трек")
            }
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
