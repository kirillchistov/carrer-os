"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createOpportunityFromText,
  createOpportunityFromUrl,
  createOpportunityManual,
} from "@/lib/actions/opportunities"
import { opportunityFormDefaults } from "@/lib/validation/opportunity"
import { OPPORTUNITY_TYPE_LABELS } from "@/lib/opportunities/labels"

export function CreateOpportunityDialog() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [pasteText, setPasteText] = useState("")
  const [url, setUrl] = useState("")
  const [manualCompany, setManualCompany] = useState("")
  const [manualTitle, setManualTitle] = useState("")
  const [manualType, setManualType] = useState<string>("vacancy")

  function goTo(opportunityId: string) {
    setOpen(false)
    router.push(`/opportunities/${opportunityId}`)
  }

  function handlePaste() {
    setError(null)
    startTransition(async () => {
      const result = await createOpportunityFromText(pasteText)
      if (result.ok) goTo(result.opportunityId)
      else setError(result.message)
    })
  }

  function handleUrl() {
    setError(null)
    startTransition(async () => {
      const result = await createOpportunityFromUrl(url)
      if (result.ok) goTo(result.opportunityId)
      else setError(result.message)
    })
  }

  function handleManual() {
    setError(null)
    startTransition(async () => {
      const opportunity = await createOpportunityManual({
        ...opportunityFormDefaults,
        companyName: manualCompany,
        title: manualTitle,
        type: manualType as never,
      })
      goTo(opportunity.id)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Новая возможность
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Новая возможность</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="url">
          <TabsList>
            <TabsTrigger value="url">По ссылке</TabsTrigger>
            <TabsTrigger value="paste">Вставить текст</TabsTrigger>
            <TabsTrigger value="manual">Вручную</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="flex flex-col gap-3 pt-4">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://company.com/careers/role"
            />
            <p className="text-xs text-muted-foreground">
              Мы загрузим публичную страницу и попросим AI структурировать требования. Если
              страница защищена или недоступна — вставьте текст вручную.
            </p>
            <div>
              <Button onClick={handleUrl} disabled={pending || !url.trim()}>
                {pending ? "Загружаем..." : "Загрузить и разобрать"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="paste" className="flex flex-col gap-3 pt-4">
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={8}
              placeholder="Вставьте текст вакансии, описание проекта или письмо..."
            />
            <div>
              <Button onClick={handlePaste} disabled={pending || pasteText.trim().length < 20}>
                {pending ? "Разбираем..." : "Разобрать текст"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="flex flex-col gap-3 pt-4">
            <div className="flex flex-col gap-2">
              <Label>Компания</Label>
              <Input value={manualCompany} onChange={(e) => setManualCompany(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Название роли</Label>
              <Input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Тип</Label>
              <Select value={manualType} onValueChange={(v) => v && setManualType(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(value: string) => OPPORTUNITY_TYPE_LABELS[value]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button onClick={handleManual} disabled={pending || !manualCompany.trim() || !manualTitle.trim()}>
                {pending ? "Создаём..." : "Создать"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  )
}
