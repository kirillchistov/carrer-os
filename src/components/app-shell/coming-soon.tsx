import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ComingSoonSection({
  title,
  description,
  phaseNote,
}: {
  title: string
  description: string
  phaseNote: string
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Раздел в разработке</CardTitle>
          <CardDescription>{phaseNote}</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
