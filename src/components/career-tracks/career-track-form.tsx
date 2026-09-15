"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { TagsInput } from "@/components/ui/tags-input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { careerTrackFormSchema, type CareerTrackFormValues } from "@/lib/validation/career-track"

const EMPLOYMENT_FORMAT_LABELS: Record<string, string> = {
  permanent: "Постоянная роль",
  contract: "Контракт",
  project: "Проект",
  fractional: "Fractional",
  advisory: "Advisory",
}

export function CareerTrackForm({
  defaultValues,
  onSubmit,
  submitLabel = "Сохранить",
}: {
  defaultValues: CareerTrackFormValues
  onSubmit: (values: CareerTrackFormValues) => Promise<void>
  submitLabel?: string
}) {
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<CareerTrackFormValues>({
    resolver: zodResolver(careerTrackFormSchema),
    defaultValues,
  })

  async function handleSubmit(values: CareerTrackFormValues) {
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
              <FormLabel>Целевая роль</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Commercial Director" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="alternativeTitles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Альтернативные названия</FormLabel>
              <FormControl>
                <TagsInput value={field.value} onChange={field.onChange} placeholder="VP Commercial, CRO..." />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="employmentFormats"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Форматы занятости</FormLabel>
              <div className="flex flex-wrap gap-3">
                {Object.entries(EMPLOYMENT_FORMAT_LABELS).map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={field.value.includes(value as never)}
                      onCheckedChange={(checked) => {
                        field.onChange(checked ? [...field.value, value] : field.value.filter((v) => v !== value))
                      }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="targetIndustries"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Целевые индустрии</FormLabel>
                <FormControl>
                  <TagsInput value={field.value} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetCompanyTypes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип компаний</FormLabel>
                <FormControl>
                  <TagsInput value={field.value} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetCompanyStages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Стадия компании</FormLabel>
                <FormControl>
                  <TagsInput value={field.value} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetCompanySizes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Размер компаний</FormLabel>
                <FormControl>
                  <TagsInput value={field.value} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="businessProblems"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Решаемые бизнес-задачи</FormLabel>
              <FormControl>
                <TagsInput value={field.value} onChange={field.onChange} placeholder="Стагнация выручки..." />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mustHaveSkills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ключевые компетенции</FormLabel>
              <FormControl>
                <TagsInput value={field.value} onChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="valueProposition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value proposition</FormLabel>
              <FormDescription>
                «Я помогаю [тип компании] решить [проблему] через [компетенции], опираясь на
                [результат]».
              </FormDescription>
              <FormControl>
                <Textarea {...field} value={field.value ?? ""} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="motivationStatement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Почему этот трек, почему сейчас</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value ?? ""} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="deemphasizedExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Что не стоит акцентировать</FormLabel>
              <FormDescription>
                Рискованный или неактуальный опыт, который не нужно выносить на первый план.
              </FormDescription>
              <FormControl>
                <Textarea {...field} value={field.value ?? ""} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(!!c)} />
                Активный трек
              </label>
            </FormItem>
          )}
        />

        <div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Сохраняем..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
