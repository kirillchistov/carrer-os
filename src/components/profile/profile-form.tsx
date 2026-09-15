"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { toast } from "sonner"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  profileFormSchema,
  profileFormDefaults,
  type ProfileFormValues,
} from "@/lib/validation/profile"
import { saveMyProfile } from "@/lib/actions/profile"

const EMPLOYMENT_FORMAT_LABELS: Record<string, string> = {
  permanent: "Постоянная роль",
  contract: "Контракт",
  project: "Проект",
  fractional: "Fractional",
  advisory: "Advisory",
}

const WORK_MODE_LABELS: Record<string, string> = {
  onsite: "Офис",
  hybrid: "Гибрид",
  remote: "Удалённо",
}

export function ProfileForm({
  initialValues,
  onSuccess,
}: {
  initialValues: ProfileFormValues
  onSuccess?: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { ...profileFormDefaults, ...initialValues },
  })

  async function onSubmit(values: ProfileFormValues) {
    setSubmitting(true)
    try {
      await saveMyProfile(values)
      toast.success("Профиль сохранён")
      onSuccess?.()
    } catch {
      toast.error("Не удалось сохранить профиль")
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
              name="headline"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Позиционирование</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Коммерческий директор, 18 лет в retail и e-commerce"
                    />
                  </FormControl>
                  <FormMessage />
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
                    <Input {...field} value={field.value ?? ""} placeholder="Москва" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Телефон</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Сайт / портфолио</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Предпочтения по формату работы</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="preferredFormats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Форматы занятости</FormLabel>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(EMPLOYMENT_FORMAT_LABELS).map(([value, label]) => (
                      <label key={value} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={field.value.includes(value as never)}
                          onCheckedChange={(checked) => {
                            field.onChange(
                              checked
                                ? [...field.value, value]
                                : field.value.filter((v) => v !== value)
                            )
                          }}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetWorkModes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Формат присутствия</FormLabel>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(WORK_MODE_LABELS).map(([value, label]) => (
                      <label key={value} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={field.value.includes(value as never)}
                          onCheckedChange={(checked) => {
                            field.onChange(
                              checked
                                ? [...field.value, value]
                                : field.value.filter((v) => v !== value)
                            )
                          }}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetLocations"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Целевые локации</FormLabel>
                  <FormControl>
                    <TagsInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Добавьте локацию и нажмите Enter"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="compensationMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Компенсация от</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="compensationMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Компенсация до</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
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
                    <Input {...field} value={field.value ?? ""} placeholder="RUB" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Индустрии и компании</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="preferredIndustries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Индустрии</FormLabel>
                  <FormControl>
                    <TagsInput value={field.value} onChange={field.onChange} placeholder="retail, fintech..." />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredCompanyTypes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип компаний</FormLabel>
                  <FormControl>
                    <TagsInput value={field.value} onChange={field.onChange} placeholder="scale-up, enterprise..." />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredCompanySizes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Размер компаний</FormLabel>
                  <FormControl>
                    <TagsInput value={field.value} onChange={field.onChange} placeholder="200-1000..." />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredCompanyStages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Стадия компании</FormLabel>
                  <FormControl>
                    <TagsInput value={field.value} onChange={field.onChange} placeholder="growth, seed..." />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Контекст и ограничения</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="openToLowerLevelIfScopeFits"
              render={({ field }) => (
                <FormItem>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(!!c)} />
                    Я открыт(а) к роли уровня ниже предыдущей, если scope подходит
                  </label>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="careerChangeReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Почему я рассматриваю следующий карьерный шаг сейчас?</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentSituation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Текущая ситуация</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nonNegotiables"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Non-negotiables</FormLabel>
                  <FormDescription>Что для вас неприемлемо в следующей роли.</FormDescription>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Сохраняем..." : "Сохранить профиль"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
