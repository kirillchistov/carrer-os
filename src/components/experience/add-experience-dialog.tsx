"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ExperienceForm } from "@/components/experience/experience-form"
import { createExperienceManual } from "@/lib/actions/experience"
import type { ExperienceFormValues } from "@/lib/validation/experience"

const emptyValues: ExperienceFormValues = {
  companyName: "",
  companyIndustry: null,
  title: "",
  employmentType: null,
  startDate: null,
  endDate: null,
  isCurrent: false,
  location: null,
  description: null,
  responsibilities: [],
  teamSize: null,
  budgetDescription: null,
}

export function AddExperienceDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Plus className="size-4" />
        Добавить вручную
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Добавить опыт</DialogTitle>
        </DialogHeader>
        <ExperienceForm
          defaultValues={emptyValues}
          submitLabel="Добавить"
          onSubmit={async (values) => {
            await createExperienceManual(values)
            toast.success("Добавлено")
            setOpen(false)
            router.refresh()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
