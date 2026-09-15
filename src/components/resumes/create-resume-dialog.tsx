"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createResume, createResumeFromProfile } from "@/lib/actions/resumes"

type Option = { id: string; label: string }

export function CreateResumeDialog({ careerTrackOptions }: { careerTrackOptions: Option[] }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [careerTrackId, setCareerTrackId] = useState<string | undefined>(undefined)
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleCreate(fromProfile: boolean) {
    if (!name.trim()) return
    setPending(true)
    try {
      const resume = await (fromProfile ? createResumeFromProfile : createResume)({
        name: name.trim(),
        language: "ru",
        careerTrackId: careerTrackId ?? null,
      })
      setOpen(false)
      router.push(`/resumes/${resume.id}`)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Новое резюме
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новое резюме</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="resume-name">Название</Label>
            <Input
              id="resume-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Base — Commercial Director (RU)"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Карьерный трек</Label>
            <Select value={careerTrackId} onValueChange={(value) => setCareerTrackId(value ?? undefined)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Не привязано" />
              </SelectTrigger>
              <SelectContent>
                {careerTrackOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" disabled={pending || !name.trim()} onClick={() => handleCreate(false)}>
            Создать пустое
          </Button>
          <Button disabled={pending || !name.trim()} onClick={() => handleCreate(true)}>
            Создать из профиля
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
