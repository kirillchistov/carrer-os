"use client"

import Link from "next/link"
import { Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { summarizeMatch } from "@/lib/quick-tailor/summary"
import type { QuickTailorMatch } from "@/lib/validation/quick-tailor"

export function QuickTailorBridge({
  title,
  companyName,
  opportunityId,
  resumeId,
  resumeVersionId,
  match,
}: {
  title: string
  companyName: string
  opportunityId: string
  resumeId: string
  resumeVersionId: string
  match: QuickTailorMatch | null
}) {
  const gaps = match?.requirements.filter((r) => r.coverage === "missing" || r.coverage === "partial") ?? []
  const counts = match ? summarizeMatch(match) : null

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="text-base">Сохранено в аккаунт</CardTitle>
        <CardDescription>
          Возможность «{title} — {companyName}» в Воронке, версия резюме в Резюме, черновик письма в
          отклике. Онбординг для этого не нужен.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {counts ? (
          <p className="text-sm text-muted-foreground">
            По тексту резюме закрыто {counts.full} из {counts.total} требований
            {counts.missing + counts.partial > 0
              ? `, ${counts.missing + counts.partial} нужно усилить фактами из опыта.`
              : "."}
          </p>
        ) : null}
        {gaps.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-medium">Чего не хватает в опыте (из сверки)</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {gaps.slice(0, 6).map((g) => (
                <li key={g.requirement}>
                  {g.requirement}
                  {g.coverage === "missing" ? " — в резюме нет опоры" : " — закрыто частично"}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Явных дыр в сверке нет — всё равно проверьте формулировки перед отправкой.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            nativeButton={false}
            render={<a href={`/api/resume-versions/${resumeVersionId}/export?format=pdf`} />}
          >
            <Download className="size-4" />
            Скачать PDF
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={`/api/resume-versions/${resumeVersionId}/export`} />}
          >
            <Download className="size-4" />
            .docx
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href={`/opportunities/${opportunityId}`} />}>
            Открыть возможность
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/opportunities/${opportunityId}/fit`} />}
          >
            Fit-отчёт
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/pipeline" />}>
            Воронка
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href={`/resumes/${resumeId}`} />}>
            Резюме
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
