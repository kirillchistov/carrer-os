"use client"

import { useRef, useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Sparkles,
  Download,
  ArrowRight,
  ArrowLeft,
  Copy,
  LoaderCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  extractResumeTextFromFile,
  extractVacancyTextFromUrl,
  analyzeMatch,
  runQuickTailor,
  saveQuickTailorEdits,
  type QuickTailorJobInput,
  type QuickTailorJobResult,
} from "@/lib/actions/quick-tailor"
import type { QuickTailorMatch } from "@/lib/validation/quick-tailor"
import type { ResumeContent } from "@/lib/validation/resume"
import {
  QUICK_TAILOR_GENERATE_CREDIT_COST,
  QUICK_TAILOR_MATCH_CREDIT_COST,
  MIN_JOB_CHARS,
  MIN_RESUME_CHARS,
} from "@/lib/quick-tailor/costs"
import { creditLabel } from "@/lib/quick-tailor/summary"
import { MatchMatrix } from "@/components/quick-tailor/match-matrix"
import { ResumePreviewEditor } from "@/components/quick-tailor/resume-preview-editor"
import { QuickTailorBridge } from "@/components/quick-tailor/quick-tailor-bridge"
import { AiFeedbackButton } from "@/components/ai/ai-feedback-button"

const STEPS = ["Резюме", "Вакансия", "Совпадение", "Уточнения", "Результат"] as const

type PendingKind = "extract" | "url" | "match" | "generate" | "save" | null

function emptyJob(): QuickTailorJobInput {
  return { title: "", companyName: "", text: "" }
}

function CreditHint({ cost, balance }: { cost: number; balance: number | null }) {
  if (balance === null) {
    return <p className="text-xs text-muted-foreground">Спишет {creditLabel(cost)}.</p>
  }
  if (balance < cost) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
        <p className="font-medium text-destructive">Недостаточно кредитов</p>
        <p className="mt-1 text-muted-foreground">
          Нужно {creditLabel(cost)}, сейчас {balance}. Пополнить в интерфейсе нельзя — баланс в
          Настройках.
        </p>
        <Link href="/settings" className="mt-2 inline-block underline underline-offset-4">
          Открыть Настройки
        </Link>
      </div>
    )
  }
  return (
    <p className="text-xs text-muted-foreground">
      Спишет {creditLabel(cost)} из {balance}.
    </p>
  )
}

function pendingLabel(kind: PendingKind): string | null {
  switch (kind) {
    case "extract":
      return "Читаем файл…"
    case "url":
      return "Загружаем страницу вакансии…"
    case "match":
      return "Разбираем вакансию и сверяем с опытом…"
    case "generate":
      return "Собираем резюме и письмо…"
    case "save":
      return "Сохраняем правки…"
    default:
      return null
  }
}

export function QuickTailorWizard({ creditBalance }: { creditBalance: number | null }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [resumeText, setResumeText] = useState("")
  const [job, setJob] = useState<QuickTailorJobInput>(emptyJob())
  const [vacancyUrl, setVacancyUrl] = useState("")
  const [match, setMatch] = useState<QuickTailorMatch | null>(null)
  const [matchAiRunId, setMatchAiRunId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<(QuickTailorJobResult & { ok: true }) | null>(null)
  const [editedResume, setEditedResume] = useState<ResumeContent | null>(null)
  const [editedLetter, setEditedLetter] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pendingKind, setPendingKind] = useState<PendingKind>(null)
  const [localBalance, setLocalBalance] = useState(creditBalance)
  const [pending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const vacancyFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalBalance(creditBalance)
  }, [creditBalance])

  const busy = pending || pendingKind !== null

  function go(nextStep: number) {
    setError(null)
    setStep(nextStep)
  }

  function handleFileUpload(file: File) {
    setError(null)
    const formData = new FormData()
    formData.set("file", file)
    setPendingKind("extract")
    startTransition(async () => {
      const extracted = await extractResumeTextFromFile(formData)
      if (extracted.ok) setResumeText(extracted.text)
      else setError(extracted.message)
      if (fileInputRef.current) fileInputRef.current.value = ""
      setPendingKind(null)
    })
  }

  function handleVacancyFile(file: File) {
    setError(null)
    const formData = new FormData()
    formData.set("file", file)
    setPendingKind("extract")
    startTransition(async () => {
      const extracted = await extractResumeTextFromFile(formData)
      if (extracted.ok) setJob((prev) => ({ ...prev, text: extracted.text }))
      else setError(extracted.message)
      if (vacancyFileRef.current) vacancyFileRef.current.value = ""
      setPendingKind(null)
    })
  }

  function handleFetchUrl() {
    setError(null)
    setPendingKind("url")
    startTransition(async () => {
      const extracted = await extractVacancyTextFromUrl(vacancyUrl.trim())
      if (extracted.ok) {
        setJob((prev) => ({
          ...prev,
          text: extracted.text,
          title: prev.title || extracted.title || "",
        }))
      } else {
        setError(extracted.message)
      }
      setPendingKind(null)
    })
  }

  function handleAnalyze() {
    setError(null)
    setPendingKind("match")
    startTransition(async () => {
      const analyzed = await analyzeMatch(resumeText, job)
      if (!analyzed.ok) {
        setError(analyzed.message)
        setPendingKind(null)
        return
      }
      setMatch(analyzed.match)
      setMatchAiRunId(analyzed.aiRunId)
      setLocalBalance((b) => (b === null ? null : b - analyzed.creditCost))
      const initial: Record<string, string> = {}
      for (const q of analyzed.match.questions) initial[q.id] = ""
      setAnswers(initial)
      setPendingKind(null)
      setStep(2)
    })
  }

  function handleGenerate() {
    if (!match) return
    setError(null)
    setPendingKind("generate")
    startTransition(async () => {
      const generated = await runQuickTailor({
        resumeText,
        job,
        match,
        answers: match.questions.map((q) => ({
          id: q.id,
          prompt: q.prompt,
          answer: answers[q.id] ?? "",
        })),
      })
      if (!generated.ok) {
        setError(generated.message)
        setPendingKind(null)
        return
      }
      setResult(generated)
      setEditedResume(generated.resume)
      setEditedLetter(generated.coverLetter)
      setLocalBalance((b) => (b === null ? null : b - QUICK_TAILOR_GENERATE_CREDIT_COST))
      setPendingKind(null)
      setStep(4)
      router.refresh()
    })
  }

  function handleSaveEdits() {
    if (!result || !editedResume) return
    setPendingKind("save")
    startTransition(async () => {
      const saved = await saveQuickTailorEdits({
        resumeVersionId: result.resumeVersionId,
        resume: editedResume,
        coverLetter: editedLetter,
      })
      if (saved.ok) toast.success("Правки сохранены")
      else toast.error(saved.message)
      setPendingKind(null)
    })
  }

  async function copyLetter() {
    try {
      await navigator.clipboard.writeText(editedLetter)
      toast.success("Письмо скопировано")
    } catch {
      toast.error("Не удалось скопировать")
    }
  }

  function downloadLetter() {
    const blob = new Blob([editedLetter], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cover-letter-${result?.companyName ?? "letter"}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function resetToVacancy() {
    setJob(emptyJob())
    setVacancyUrl("")
    setMatch(null)
    setMatchAiRunId(null)
    setAnswers({})
    setResult(null)
    setEditedResume(null)
    setEditedLetter("")
    setError(null)
    setStep(1)
  }

  function resetAll() {
    setResumeText("")
    resetToVacancy()
    setStep(0)
  }

  const status = pendingLabel(pendingKind)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
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
            {i < STEPS.length - 1 && <span className="mx-1 hidden h-px w-6 bg-border sm:block" aria-hidden />}
          </div>
        ))}
      </div>

      {status && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
          <LoaderCircle className="size-4 shrink-0 animate-spin" aria-hidden />
          <div>
            <p className="font-medium">{status}</p>
            <p className="text-muted-foreground">Это занимает обычно 10–30 секунд, кредиты уже зарезервированы.</p>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Загрузите резюме</CardTitle>
            <CardDescription>
              Вставьте текст или загрузите .docx / .pdf. Файл не изменится — это только основа для
              адаптации.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Tabs defaultValue="paste">
              <TabsList>
                <TabsTrigger value="paste">Вставить текст</TabsTrigger>
                <TabsTrigger value="file">Загрузить файл</TabsTrigger>
              </TabsList>
              <TabsContent value="paste" className="pt-4">
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={12}
                  placeholder="Вставьте текст вашего резюме целиком..."
                />
              </TabsContent>
              <TabsContent value="file" className="flex flex-col gap-3 pt-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  .docx или .pdf, до 10 МБ. Сканы PDF могут не распознаться — тогда вставьте текст.
                </p>
                {resumeText && (
                  <p className="text-sm text-muted-foreground">
                    Текст извлечён ({resumeText.length} символов) — можно поправить во вкладке «Вставить текст».
                  </p>
                )}
              </TabsContent>
            </Tabs>
            <Button className="w-fit" disabled={resumeText.trim().length < MIN_RESUME_CHARS} onClick={() => go(1)}>
              Далее
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Вакансия</CardTitle>
            <CardDescription>
              Одна вакансия за проход — так сверка и письмо остаются точными. После результата можно
              взять ту же основу и другую роль.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Компания (необязательно)"
                value={job.companyName}
                onChange={(e) => setJob((prev) => ({ ...prev, companyName: e.target.value }))}
              />
              <Input
                placeholder="Название роли (необязательно)"
                value={job.title}
                onChange={(e) => setJob((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <Tabs defaultValue="paste">
              <TabsList>
                <TabsTrigger value="paste">Вставить текст</TabsTrigger>
                <TabsTrigger value="url">Ссылка</TabsTrigger>
                <TabsTrigger value="file">Файл</TabsTrigger>
              </TabsList>
              <TabsContent value="paste" className="pt-4">
                <Textarea
                  value={job.text}
                  onChange={(e) => setJob((prev) => ({ ...prev, text: e.target.value }))}
                  rows={8}
                  placeholder="Вставьте описание вакансии с hh, SuperJob или из письма рекрутера..."
                />
              </TabsContent>
              <TabsContent value="url" className="flex flex-col gap-3 pt-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder="https://hh.ru/vacancy/…"
                    value={vacancyUrl}
                    onChange={(e) => setVacancyUrl(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    disabled={busy || vacancyUrl.trim().length < 8}
                    onClick={handleFetchUrl}
                  >
                    Загрузить
                  </Button>
                </div>
                {job.text && (
                  <p className="text-sm text-muted-foreground">
                    Текст загружен ({job.text.length} символов) — его можно поправить во вкладке «Вставить текст».
                  </p>
                )}
              </TabsContent>
              <TabsContent value="file" className="flex flex-col gap-3 pt-4">
                <input
                  ref={vacancyFileRef}
                  type="file"
                  accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleVacancyFile(file)
                  }}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">.docx или .pdf с текстом вакансии.</p>
              </TabsContent>
            </Tabs>
            <CreditHint cost={QUICK_TAILOR_MATCH_CREDIT_COST} balance={localBalance} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => go(0)}>
                <ArrowLeft className="size-4" />
                Назад
              </Button>
              <Button
                disabled={
                  busy ||
                  job.text.trim().length < MIN_JOB_CHARS ||
                  (localBalance !== null && localBalance < QUICK_TAILOR_MATCH_CREDIT_COST)
                }
                onClick={handleAnalyze}
              >
                <Sparkles className="size-4" />
                Сверить с вакансией
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && match && (
        <div className="flex flex-col gap-4">
          <MatchMatrix match={match} aiRunId={matchAiRunId} />
          <CreditHint cost={QUICK_TAILOR_GENERATE_CREDIT_COST} balance={localBalance} />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => go(1)}>
              <ArrowLeft className="size-4" />
              Другая вакансия
            </Button>
            <Button onClick={() => go(3)}>
              {match.questions.length > 0 ? "Ответить на уточнения" : "К сборке резюме"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && match && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Уточнения</CardTitle>
            <CardDescription>
              Если в резюме нет факта — мы не выдумаем его. Можно пропустить вопрос: пробел
              останется пробелом.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {match.questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Дополнительных вопросов нет — можно собирать резюме из того, что уже есть в тексте.
              </p>
            ) : (
              match.questions.map((q) => (
                <div key={q.id} className="flex flex-col gap-2">
                  <p className="text-sm font-medium">{q.prompt}</p>
                  <p className="text-xs text-muted-foreground">{q.why}</p>
                  <Textarea
                    value={answers[q.id] ?? ""}
                    rows={3}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Короткий ответ своими словами, или оставьте пустым"
                  />
                </div>
              ))
            )}
            <CreditHint cost={QUICK_TAILOR_GENERATE_CREDIT_COST} balance={localBalance} />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => go(2)}>
                <ArrowLeft className="size-4" />
                Назад
              </Button>
              <Button
                disabled={busy || (localBalance !== null && localBalance < QUICK_TAILOR_GENERATE_CREDIT_COST)}
                onClick={handleGenerate}
              >
                <Sparkles className="size-4" />
                Собрать резюме и письмо
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && result && editedResume && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-base">
                  {result.title} — {result.companyName}
                </CardTitle>
                <CardDescription>Проверьте факты до отправки. Правки сохраняются в версию резюме.</CardDescription>
              </div>
              <AiFeedbackButton aiRunId={result.aiRunId} targetType="ai_run" targetId={result.resumeVersionId} />
            </CardHeader>
            <CardContent className="flex flex-col gap-6 lg:flex-row">
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-sm font-medium">Адаптированное резюме</p>
                <ResumePreviewEditor content={editedResume} onChange={setEditedResume} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div>
                  <p className="mb-2 text-sm font-medium">Что изменено и почему</p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {result.keyChanges.map((c, i) => (
                      <li key={i}>
                        {c.change}
                        {c.requirement ? (
                          <span className="text-foreground/80"> — {c.requirement}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Сопроводительное письмо</p>
                  <Textarea value={editedLetter} onChange={(e) => setEditedLetter(e.target.value)} rows={10} />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={copyLetter}>
                      <Copy className="size-4" />
                      Копировать
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadLetter}>
                      <Download className="size-4" />
                      .txt
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={busy} onClick={handleSaveEdits}>
              Сохранить правки
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<a href={`/api/resume-versions/${result.resumeVersionId}/export`} />}
            >
              <Download className="size-4" />
              .docx
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<a href={`/api/resume-versions/${result.resumeVersionId}/export?format=pdf`} />}
            >
              <Download className="size-4" />
              .pdf
            </Button>
          </div>

          <QuickTailorBridge
            title={result.title}
            companyName={result.companyName}
            opportunityId={result.opportunityId}
            resumeId={result.resumeId}
            resumeVersionId={result.resumeVersionId}
            match={match}
          />

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={resetToVacancy}>
              Другая вакансия с этим резюме
            </Button>
            <Button variant="outline" onClick={resetAll}>
              Начать заново
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
