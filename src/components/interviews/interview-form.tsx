"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { interviewFormSchema, type InterviewFormValues } from "@/lib/validation/interview"
import { INTERVIEW_TYPE_LABELS } from "@/lib/opportunities/labels"

export function InterviewForm({
  defaultValues,
  onSubmit,
  submitLabel = "Сохранить",
}: {
  defaultValues: InterviewFormValues
  onSubmit: (values: InterviewFormValues) => Promise<void>
  submitLabel?: string
}) {
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues,
  })

  async function handleSubmit(values: InterviewFormValues) {
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
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Дата</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Этап</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите этап">
                        {(value: string) => INTERVIEW_TYPE_LABELS[value]}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(INTERVIEW_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interviewerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Интервьюер</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interviewerTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Должность интервьюера</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="questions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Заданные вопросы (по одному на строку)</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value ?? ""} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Заметки (о чём говорили, что рассказали вы)</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value ?? ""} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Обратная связь от интервьюера</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value ?? ""} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="interestSignals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Сигналы интереса</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value ?? ""} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="objections"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Возражения / сомнения</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value ?? ""} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="agreements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Договорённости</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value ?? ""} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="nextStep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Следующий шаг</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nextStepAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Срок следующего шага</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value?.slice(0, 10) ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={submitting} className="w-fit">
          {submitting ? "Сохраняем..." : submitLabel}
        </Button>
      </form>
    </Form>
  )
}
