"use client"

import { useRef, useState, useTransition } from "react"
import Link from "next/link"
import { Sparkles, Plus, Trash2, Download, ArrowRight, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  extractResumeTextFromDocx,
  runQuickTailor,
  type QuickTailorJobInput,
  type QuickTailorJobResult,
} from "@/lib/actions/quick-tailor"

const STEPS = ["Резюме", "Вакансии", "Результат"] as const
const MAX_JOBS = 3

function emptyJob(): QuickTailorJobInput {
  return { title: "", companyName: "", text: "" }
}

export function QuickTailorWizard() {
  const [step, setStep] = useState(0)
  const [resumeText, setResumeText] = useState("")
  const [jobs, setJobs] = useState<QuickTailorJobInput[]>([emptyJob()])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [results, setResults] = useState<QuickTailorJobResult[] | null>(null)
  const [pending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileUpload(file: File) {
    setUploadError(null)
    const formData = new FormData()
    formData.set("file", file)
    startTransition(async () => {
      const result = await extractResumeTextFromDocx(formData)
      if (result.ok) {
        setResumeText(result.text)
      } else {
        setUploadError(result.message)
      }
      if (fileInputRef.current) fileInputRef.current.value = ""
    })
  }

  function updateJob(index: number, patch: Partial<QuickTailorJobInput>) {
    setJobs((prev) => prev.map((j, i) => (i === index ? { ...j, ...patch } : j)))
  }

  function handleSubmit() {
    setSubmitError(null)
    startTransition(async () => {
      try {
        const { results } = await runQuickTailor(resumeText, jobs)
        setResults(results)
        setStep(2)
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Не удалось запустить обработку.")
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={
                "flex size-6 items-center justify-center rounded-full text-xs font-medium " +
                (i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")
              }
            >
              {i + 1}
            </span>
            <span className={i <= step ? "text-sm font-medium" : "text-sm text-muted-foreground"}>{label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border" aria-hidden />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Загрузите резюме</CardTitle>
            <CardDescription>Вставьте текст или загрузите .docx — оно не будет изменено, только использовано как основа.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Tabs defaultValue="paste">
              <TabsList>
                <TabsTrigger value="paste">Вставить текст</TabsTrigger>
                <TabsTrigger value="docx">Загрузить .docx</TabsTrigger>
              </TabsList>
              <TabsContent value="paste" className="pt-4">
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={12}
                  placeholder="Вставьте текст вашего резюме целиком..."
                />
              </TabsContent>
              <TabsContent value="docx" className="flex flex-col gap-3 pt-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx"
                  disabled={pending}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">Поддерживается формат .docx, до 10 МБ. PDF пока не поддерживается.</p>
                {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
                {resumeText && (
                  <p className="text-sm text-muted-foreground">
                    Текст извлечён ({resumeText.length} символов) — можно отредактировать во вкладке «Вставить текст».
                  </p>
                )}
              </TabsContent>
            </Tabs>
            <Button className="w-fit" disabled={resumeText.trim().length < 50} onClick={() => setStep(1)}>
              Далее
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          {jobs.map((job, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Вакансия {i + 1}</CardTitle>
                {jobs.length > 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Удалить вакансию"
                    onClick={() => setJobs((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Компания (необязательно)"
                    value={job.companyName}
                    onChange={(e) => updateJob(i, { companyName: e.target.value })}
                  />
                  <Input
                    placeholder="Название роли (необязательно)"
                    value={job.title}
                    onChange={(e) => updateJob(i, { title: e.target.value })}
                  />
                </div>
                <Textarea
                  value={job.text}
                  onChange={(e) => updateJob(i, { text: e.target.value })}
                  rows={6}
                  placeholder="Вставьте текст описания вакансии..."
                />
              </CardContent>
            </Card>
          ))}

          {jobs.length < MAX_JOBS && (
            <Button variant="outline" className="w-fit" onClick={() => setJobs((prev) => [...prev, emptyJob()])}>
              <Plus className="size-4" />
              Добавить ещё вакансию
            </Button>
          )}

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)}>
              <ArrowLeft className="size-4" />
              Назад
            </Button>
            <Button
              disabled={pending || jobs.every((j) => j.text.trim().length < 30)}
              onClick={handleSubmit}
            >
              <Sparkles className="size-4" />
              {pending ? "Готовим резюме и письма..." : "Получить резюме и письма"}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && results && (
        <div className="flex flex-col gap-4">
          {results.map((r, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">
                  {r.title} — {r.companyName}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {r.ok ? (
                  <>
                    <div>
                      <p className="mb-1 text-sm font-medium">Что изменено и почему</p>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        {r.keyChanges.map((c, j) => (
                          <li key={j}>{c}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium">Сопроводительное сообщение</p>
                      <Textarea readOnly value={r.coverLetter} rows={6} className="text-sm text-muted-foreground" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        nativeButton={false}
                        render={<a href={`/api/resume-versions/${r.resumeVersionId}/export`} />}
                      >
                        <Download className="size-4" />
                        .docx
                      </Button>
                      <Button
                        variant="outline"
                        nativeButton={false}
                        render={<a href={`/api/resume-versions/${r.resumeVersionId}/export?format=pdf`} />}
                      >
                        <Download className="size-4" />
                        .pdf
                      </Button>
                      <Button
                        variant="ghost"
                        nativeButton={false}
                        render={<Link href={`/opportunities/${r.opportunityId}`} />}
                      >
                        Открыть возможность
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-destructive">{r.message}</p>
                )}
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => {
              setStep(0)
              setResumeText("")
              setJobs([emptyJob()])
              setResults(null)
            }}
          >
            Начать заново
          </Button>
        </div>
      )}
    </div>
  )
}
