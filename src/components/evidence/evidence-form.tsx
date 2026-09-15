"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { TagsInput } from "@/components/ui/tags-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { evidenceFormSchema, type EvidenceFormValues } from "@/lib/validation/evidence"

type Option = { id: string; label: string }

export function EvidenceForm({
  defaultValues,
  careerTrackOptions,
  experienceOptions,
  onSubmit,
  submitLabel = "Сохранить",
}: {
  defaultValues: EvidenceFormValues
  careerTrackOptions: Option[]
  experienceOptions: Option[]
  onSubmit: (values: EvidenceFormValues) => Promise<void>
  submitLabel?: string
}) {
  const [submitting, setSubmitting] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const form = useForm<EvidenceFormValues>({
    resolver: zodResolver(evidenceFormSchema),
    defaultValues,
  })

  async function handleSubmit(values: EvidenceFormValues) {
    setSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Запуск e-commerce канала с нуля" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="careerTrackId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Карьерный трек</FormLabel>
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Не привязано" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {careerTrackOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="experienceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Связанный опыт</FormLabel>
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Не привязано" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {experienceOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="situation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ситуация</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value ?? ""} rows={2} placeholder="Какой была исходная проблема?" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="task"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Задача</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value ?? ""} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="action"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ваши действия</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value ?? ""} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="result"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Результат</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value ?? ""} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
        >
          {showDetails ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          Дополнительные детали (метрика, масштаб, навыки)
        </button>

        {showDetails && (
          <div className="flex flex-col gap-4 rounded-md border p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="metricValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Метрика (число)</FormLabel>
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
                name="metricUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Единица измерения</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="% от выручки" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Период</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="2020–2022" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="metricDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пояснение к метрике</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="scaleDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Масштаб</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teamSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Размер команды</FormLabel>
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
                name="budgetDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Бюджет</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pAndLDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>P&L</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="industries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Индустрии</FormLabel>
                    <FormControl>
                      <TagsInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Навыки</FormLabel>
                    <FormControl>
                      <TagsInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <FormField
                control={form.control}
                name="isReusableInResume"
                render={({ field }) => (
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(!!c)} />
                    Использовать в резюме
                  </label>
                )}
              />
              <FormField
                control={form.control}
                name="isReusableInInterview"
                render={({ field }) => (
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(!!c)} />
                    Использовать на интервью
                  </label>
                )}
              />
              <FormField
                control={form.control}
                name="isReusableInOutreach"
                render={({ field }) => (
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(!!c)} />
                    Использовать в письмах
                  </label>
                )}
              />
            </div>
          </div>
        )}

        <div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Сохраняем..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
