"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AiFeedbackButton } from "@/components/ai/ai-feedback-button"
import { updateRequirements } from "@/lib/actions/opportunities"
import {
  REQUIREMENT_CATEGORY_LABELS,
  REQUIREMENT_IMPORTANCE_LABELS,
} from "@/lib/opportunities/labels"
import type { RequirementFormValues } from "@/lib/validation/opportunity"

type RequirementRow = RequirementFormValues & { key: string }

let counter = 0
function newKey() {
  counter += 1
  return `new-${counter}`
}

export function RequirementsEditor({
  opportunityId,
  initialRequirements,
}: {
  opportunityId: string
  initialRequirements: RequirementFormValues[]
}) {
  const router = useRouter()
  const [rows, setRows] = useState<RequirementRow[]>(
    initialRequirements.map((r) => ({ ...r, key: r.id ?? newKey() }))
  )
  const [pending, startTransition] = useTransition()

  function updateRow(key: string, patch: Partial<RequirementRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { key: newKey(), id: null, category: "responsibility", text: "", importance: "must_have", normalizedSkill: null },
    ])
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key))
  }

  function save() {
    startTransition(async () => {
      await updateRequirements(
        opportunityId,
        rows.filter((r) => r.text.trim().length > 0)
      )
      router.refresh()
    })
  }

  const grouped = {
    must_have: rows.filter((r) => r.importance === "must_have"),
    nice_to_have: rows.filter((r) => r.importance === "nice_to_have"),
    inferred_context: rows.filter((r) => r.importance === "inferred_context"),
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Требования</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={addRow}>
            <Plus className="size-4" />
            Добавить
          </Button>
          <Button size="sm" disabled={pending} onClick={save}>
            {pending ? "Сохраняем..." : "Сохранить"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">Требований пока нет.</p>
        )}
        {rows.length > 0 && (
          <AiFeedbackButton
            aiRunId={null}
            targetType="opportunity_requirement"
            targetId={opportunityId}
            className="w-fit self-start px-0"
          />
        )}
        {(["must_have", "nice_to_have", "inferred_context"] as const).map(
          (importance) =>
            grouped[importance].length > 0 && (
              <div key={importance} className="flex flex-col gap-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  {REQUIREMENT_IMPORTANCE_LABELS[importance]}
                </p>
                {grouped[importance].map((row) => (
                  <div key={row.key} className="flex flex-wrap items-center gap-2 rounded-md border p-2">
                    <Select
                      value={row.category}
                      onValueChange={(v) => v && updateRow(row.key, { category: v as never })}
                    >
                      <SelectTrigger className="w-40 shrink-0">
                        <SelectValue>{(value: string) => REQUIREMENT_CATEGORY_LABELS[value]}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(REQUIREMENT_CATEGORY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={row.text}
                      onChange={(e) => updateRow(row.key, { text: e.target.value })}
                      className="min-w-48 flex-1"
                    />
                    <Select
                      value={row.importance}
                      onValueChange={(v) => v && updateRow(row.key, { importance: v as never })}
                    >
                      <SelectTrigger className="w-36 shrink-0">
                        <SelectValue>{(value: string) => REQUIREMENT_IMPORTANCE_LABELS[value]}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(REQUIREMENT_IMPORTANCE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" aria-label="Удалить требование" onClick={() => removeRow(row.key)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )
        )}
      </CardContent>
    </Card>
  )
}
