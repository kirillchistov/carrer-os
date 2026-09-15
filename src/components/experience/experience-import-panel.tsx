"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AiFeedbackButton } from "@/components/ai/ai-feedback-button"
import { importExperienceFromText, importExperienceFromDocx } from "@/lib/actions/experience"

type ImportOutcome =
  | { kind: "success"; created: number; aiRunId: string; notes: string | null }
  | { kind: "error"; message: string }
  | null

export function ExperienceImportPanel() {
  const router = useRouter()
  const [pasteText, setPasteText] = useState("")
  const [pending, startTransition] = useTransition()
  const [outcome, setOutcome] = useState<ImportOutcome>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handlePasteImport() {
    setOutcome(null)
    startTransition(async () => {
      const result = await importExperienceFromText(pasteText)
      if (result.ok) {
        setOutcome({ kind: "success", created: result.created, aiRunId: result.aiRunId, notes: result.notes })
        setPasteText("")
        router.refresh()
      } else {
        setOutcome({ kind: "error", message: result.message })
      }
    })
  }

  function handleFileImport(file: File) {
    setOutcome(null)
    const formData = new FormData()
    formData.set("file", file)
    startTransition(async () => {
      const result = await importExperienceFromDocx(formData)
      if (result.ok) {
        setOutcome({ kind: "success", created: result.created, aiRunId: result.aiRunId, notes: result.notes })
        router.refresh()
      } else {
        setOutcome({ kind: "error", message: result.message })
      }
      if (fileInputRef.current) fileInputRef.current.value = ""
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Импорт опыта</CardTitle>
        <CardDescription>
          Вставьте текст резюме или загрузите файл .docx — AI извлечёт роли, компании и
          зоны ответственности как черновик. Ничего не сохранится как подтверждённое, пока
          вы не проверите каждую запись ниже.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Tabs defaultValue="paste">
          <TabsList>
            <TabsTrigger value="paste">Вставить текст</TabsTrigger>
            <TabsTrigger value="docx">Загрузить .docx</TabsTrigger>
          </TabsList>
          <TabsContent value="paste" className="flex flex-col gap-3 pt-4">
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={8}
              placeholder="Вставьте текст резюме или описание опыта работы..."
            />
            <div>
              <Button onClick={handlePasteImport} disabled={pending || pasteText.trim().length < 20}>
                {pending ? "Извлекаем..." : "Извлечь опыт"}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="docx" className="flex flex-col gap-3 pt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              disabled={pending}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileImport(file)
              }}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Поддерживается формат .docx, до 10 МБ. PDF пока не поддерживается — вставьте
              текст вручную.
            </p>
          </TabsContent>
        </Tabs>

        {outcome?.kind === "success" && (
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <p>
              Извлечено записей: <strong>{outcome.created}</strong>. Проверьте их ниже перед
              подтверждением.
            </p>
            {outcome.notes && <p className="mt-1 text-muted-foreground">{outcome.notes}</p>}
            <AiFeedbackButton aiRunId={outcome.aiRunId} targetType="ai_run" className="mt-1 px-0" />
          </div>
        )}
        {outcome?.kind === "error" && (
          <p className="text-sm text-destructive">{outcome.message}</p>
        )}
      </CardContent>
    </Card>
  )
}
