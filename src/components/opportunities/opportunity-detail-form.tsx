"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { opportunityFormSchema, type OpportunityFormValues } from "@/lib/validation/opportunity"
import {
  OPPORTUNITY_STATUS_LABELS,
  OPPORTUNITY_STATUS_ORDER,
  OPPORTUNITY_TYPE_LABELS,
  TASK_PRIORITY_LABELS,
} from "@/lib/opportunities/labels"
import { updateOpportunity } from "@/lib/actions/opportunities"

const WORK_MODE_LABELS: Record<string, string> = { onsite: "Офис", hybrid: "Гибрид", remote: "Удалённо" }
const EMPLOYMENT_FORMAT_LABELS: Record<string, string> = {
  permanent: "Постоянная роль",
  contract: "Контракт",
  project: "Проект",
  fractional: "Fractional",
  advisory: "Advisory",
}

function toDateInputValue(iso: string | null): string {
  if (!iso) return ""
  return iso.slice(0, 10)
}

export function OpportunityDetailForm({
  opportunityId,
  defaultValues,
  rawDescription,
}: {
  opportunityId: string
  defaultValues: OpportunityFormValues
  rawDescription: string | null
}) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [showRaw, setShowRaw] = useState(false)
  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunityFormSchema),
    defaultValues,
  })

  async function onSubmit(values: OpportunityFormValues) {
    setSubmitting(true)
    try {
      await updateOpportunity(opportunityId, values)
      toast.success("Сохранено")
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Основное</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Компания</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Роль</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип</FormLabel>
                  <Select value={field.value} onValueChange={(v) => v && field.onChange(v)}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue>{(value: string) => OPPORTUNITY_TYPE_LABELS[value]}</SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Статус</FormLabel>
                  <Select value={field.value} onValueChange={(v) => v && field.onChange(v)}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue>{(value: string) => OPPORTUNITY_STATUS_LABELS[value]}</SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {OPPORTUNITY_STATUS_ORDER.map((value) => (
                        <SelectItem key={value} value={value}>
                          {OPPORTUNITY_STATUS_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Локация</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || null)} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Формат присутствия</FormLabel>
                  <Select value={field.value ?? undefined} onValueChange={(v) => field.onChange(v ?? null)}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Не указано">
                          {(value: string | null) => (value ? WORK_MODE_LABELS[value] : "Не указано")}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(WORK_MODE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employmentFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Формат занятости</FormLabel>
                  <Select value={field.value ?? undefined} onValueChange={(v) => field.onChange(v ?? null)}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Не указано">
                          {(value: string | null) => (value ? EMPLOYMENT_FORMAT_LABELS[value] : "Не указано")}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(EMPLOYMENT_FORMAT_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Приоритет</FormLabel>
                  <Select value={field.value} onValueChange={(v) => v && field.onChange(v)}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue>{(value: string) => TASK_PRIORITY_LABELS[value]}</SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Компенсация</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="compensationMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>От</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="compensationMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>До</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="compensationCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Валюта</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || null)} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Следующий шаг и дедлайны</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="nextAction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Следующее действие</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || null)} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="nextActionDueAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Срок действия</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={toDateInputValue(field.value)}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="followUpAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={toDateInputValue(field.value)}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadlineAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дедлайн</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={toDateInputValue(field.value)}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Заметки</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} rows={4} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {rawDescription && (
          <Card>
            <CardHeader>
              <button
                type="button"
                onClick={() => setShowRaw((v) => !v)}
                className="text-left text-sm text-muted-foreground hover:text-foreground"
              >
                {showRaw ? "Скрыть" : "Показать"} исходный текст
              </button>
            </CardHeader>
            {showRaw && (
              <CardContent>
                <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap text-xs text-muted-foreground">
                  {rawDescription}
                </pre>
              </CardContent>
            )}
          </Card>
        )}

        <div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Сохраняем..." : "Сохранить"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
