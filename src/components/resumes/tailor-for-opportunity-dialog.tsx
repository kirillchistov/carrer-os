"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { startResumeTailoring } from "@/lib/actions/resume-proposals"

type Option = { id: string; label: string }

export function TailorForOpportunityDialog({ resumeId, opportunities }: { resumeId: string; opportunities: Option[] }) {
  const [open, setOpen] = useState(false)
  const [opportunityId, setOpportunityId] = useState<string | undefined>(undefined)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleStart() {
    if (!opportunityId) return
    setPending(true)
    setError(null)
    try {
      const { resumeVersionId } = await startResumeTailoring(resumeId, opportunityId)
      setOpen(false)
      router.push(`/resumes/${resumeId}/versions/${resumeVersionId}`)
    } catch {
      setError("Не удалось создать версию резюме. Попробуйте ещё раз.")
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Wand2 className="size-4" />
        Тайлорить под возможность
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Тайлорить резюме</DialogTitle>
        </DialogHeader>
        {opportunities.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Сначала сохраните хотя бы одну возможность в разделе Opportunities.
          </p>
        ) : (
          <Select value={opportunityId} onValueChange={(v) => setOpportunityId(v ?? undefined)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите возможность">
                {(value: string | null) => opportunities.find((o) => o.id === value)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {opportunities.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button onClick={handleStart} disabled={pending || !opportunityId}>
            {pending ? "Готовим предложения..." : "Создать версию и получить предложения"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
