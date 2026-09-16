"use client"

import { useEffect, useRef, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TagsInput } from "@/components/ui/tags-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { resumeContentSchema, type ResumeContent } from "@/lib/validation/resume"
import { updateResumeContent } from "@/lib/actions/resumes"

export function ResumeEditor({ resumeId, initialContent }: { resumeId: string; initialContent: ResumeContent }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
  const skipFirstSave = useRef(true)

  const form = useForm<ResumeContent>({
    resolver: zodResolver(resumeContentSchema),
    defaultValues: initialContent,
  })
  const experience = useFieldArray({ control: form.control, name: "experience" })
  const education = useFieldArray({ control: form.control, name: "education" })

  const watched = form.watch()

  useEffect(() => {
    if (skipFirstSave.current) {
      skipFirstSave.current = false
      return
    }
    setStatus("saving")
    const timeout = setTimeout(() => {
      updateResumeContent(resumeId, form.getValues()).then(() => setStatus("saved"))
    }, 1200)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watched)])

  return (
    <Form {...form}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {status === "saving" && "Сохраняем..."}
            {status === "saved" && "Сохранено"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea {...field} rows={4} placeholder="Краткое резюме позиционирования" />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Опыт работы</CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => experience.append({ title: "", company: "", period: "", bullets: [] })}
            >
              <Plus className="size-4" />
              Добавить роль
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {experience.fields.map((item, index) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-md border p-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name={`experience.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Должность</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`experience.${index}.company`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Компания</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`experience.${index}.period`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Период</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name={`experience.${index}.bullets`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пункты</FormLabel>
                      <FormControl>
                        <TagsInput value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="self-start text-destructive hover:text-destructive"
                  onClick={() => experience.remove(index)}
                >
                  <Trash2 className="size-3.5" />
                  Удалить роль
                </Button>
              </div>
            ))}
            {experience.fields.length === 0 && (
              <p className="text-sm text-muted-foreground">Ролей пока нет.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Достижения</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="achievements"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TagsInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Навыки</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TagsInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Образование</CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => education.append({ degree: "", institution: "", year: "" })}
            >
              <Plus className="size-4" />
              Добавить
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {education.fields.map((item, index) => (
              <div key={item.id} className="grid gap-3 rounded-md border p-3 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name={`education.${index}.degree`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Степень</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`education.${index}.institution`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Учебное заведение</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex items-end gap-2">
                  <FormField
                    control={form.control}
                    name={`education.${index}.year`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Год</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Удалить запись об образовании"
                    onClick={() => education.remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
            {education.fields.length === 0 && (
              <p className="text-sm text-muted-foreground">Образование не указано.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Сертификаты</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="certifications"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TagsInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Проекты</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="projects"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TagsInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </Form>
  )
}
