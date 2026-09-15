"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import type { Resume } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { deleteResume } from "@/lib/actions/resumes"

export function ResumeList({ resumes }: { resumes: Resume[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  if (resumes.length === 0) {
    return <p className="text-sm text-muted-foreground">Резюме пока нет.</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {resumes.map((resume) => (
        <Card key={resume.id}>
          <CardHeader>
            <CardTitle className="text-base">{resume.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase">{resume.language}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" nativeButton={false} render={<Link href={`/resumes/${resume.id}`} />}>
                Открыть
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm("Удалить резюме?")) {
                    startTransition(async () => {
                      await deleteResume(resume.id)
                      router.refresh()
                    })
                  }
                }}
              >
                Удалить
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
