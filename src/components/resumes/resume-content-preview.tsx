import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ResumeContent } from "@/lib/validation/resume"

export function ResumeContentPreview({ content }: { content: ResumeContent }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Текущее содержимое версии</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        {content.summary && <p>{content.summary}</p>}

        {content.experience.length > 0 && (
          <div className="flex flex-col gap-3">
            {content.experience.map((entry, i) => (
              <div key={i}>
                <p className="font-medium">
                  {entry.title} — {entry.company}{" "}
                  <span className="font-normal text-muted-foreground">({entry.period})</span>
                </p>
                {entry.bullets.length > 0 && (
                  <ul className="list-disc pl-5 text-muted-foreground">
                    {entry.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {content.achievements.length > 0 && (
          <div>
            <p className="mb-1 font-medium">Достижения</p>
            <ul className="list-disc pl-5 text-muted-foreground">
              {content.achievements.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        {content.skills.length > 0 && (
          <div>
            <p className="mb-1 font-medium">Навыки</p>
            <p className="text-muted-foreground">{content.skills.join(", ")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
