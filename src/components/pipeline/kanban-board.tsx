"use client"

import { useState } from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { Opportunity, OpportunityStatus } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { listMyOpportunities, updateOpportunityStatus } from "@/lib/actions/opportunities"
import { OPPORTUNITY_STATUS_LABELS, OPPORTUNITY_STATUS_ORDER, OPPORTUNITY_TYPE_LABELS } from "@/lib/opportunities/labels"
import { cn } from "cn"

const OPPORTUNITIES_QUERY_KEY = ["opportunities"] as const

function formatDue(value: Date | string | null | undefined) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
}

export function KanbanBoard({ initialOpportunities }: { initialOpportunities: Opportunity[] }) {
  const queryClient = useQueryClient()
  const [dragOverStatus, setDragOverStatus] = useState<OpportunityStatus | null>(null)

  const { data: opportunities = [] } = useQuery({
    queryKey: OPPORTUNITIES_QUERY_KEY,
    queryFn: () => listMyOpportunities(),
    initialData: initialOpportunities,
  })

  const moveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OpportunityStatus }) => updateOpportunityStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: OPPORTUNITIES_QUERY_KEY })
      const previous = queryClient.getQueryData<Opportunity[]>(OPPORTUNITIES_QUERY_KEY)
      queryClient.setQueryData<Opportunity[]>(OPPORTUNITIES_QUERY_KEY, (old) =>
        old?.map((o) => (o.id === id ? { ...o, status } : o))
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(OPPORTUNITIES_QUERY_KEY, context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITIES_QUERY_KEY })
    },
  })

  function handleDrop(status: OpportunityStatus, e: React.DragEvent) {
    e.preventDefault()
    setDragOverStatus(null)
    const id = e.dataTransfer.getData("text/opportunity-id")
    if (!id) return
    const current = opportunities.find((o) => o.id === id)
    if (!current || current.status === status) return
    moveMutation.mutate({ id, status })
  }

  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
      {OPPORTUNITY_STATUS_ORDER.map((status) => {
        const items = opportunities.filter((o) => o.status === status)
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOverStatus(status)
            }}
            onDragLeave={() => setDragOverStatus((s) => (s === status ? null : s))}
            onDrop={(e) => handleDrop(status, e)}
            className={cn(
              "flex w-[min(16.5rem,85vw)] shrink-0 snap-start flex-col gap-2 rounded-md border bg-muted/20 p-2",
              dragOverStatus === status && "ring-2 ring-ring"
            )}
          >
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-medium text-muted-foreground">{OPPORTUNITY_STATUS_LABELS[status]}</p>
              <span className="text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="flex min-h-16 flex-col gap-2">
              {items.map((opp) => {
                const due = formatDue(opp.nextActionDueAt)
                return (
                  <Card
                    key={opp.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/opportunity-id", opp.id)
                      e.dataTransfer.effectAllowed = "move"
                    }}
                    className="cursor-grab gap-2 p-3 text-sm hover:bg-secondary/40 active:cursor-grabbing"
                  >
                    <Link href={`/opportunities/${opp.id}`} className="block">
                      <p className="font-medium">{opp.title}</p>
                      <p className="text-xs text-muted-foreground">{opp.companyName}</p>
                    </Link>
                    <Badge variant="outline" className="w-fit text-xs">
                      {OPPORTUNITY_TYPE_LABELS[opp.type]}
                    </Badge>
                    {opp.nextAction ? (
                      <p className="text-xs text-muted-foreground">
                        {opp.nextAction}
                        {due ? ` · ${due}` : ""}
                      </p>
                    ) : null}
                    <label className="sr-only" htmlFor={`status-${opp.id}`}>
                      Сменить этап
                    </label>
                    <select
                      id={`status-${opp.id}`}
                      className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                      value={opp.status}
                      onChange={(e) => {
                        const next = e.target.value as OpportunityStatus
                        if (next !== opp.status) moveMutation.mutate({ id: opp.id, status: next })
                      }}
                    >
                      {OPPORTUNITY_STATUS_ORDER.map((value) => (
                        <option key={value} value={value}>
                          {OPPORTUNITY_STATUS_LABELS[value]}
                        </option>
                      ))}
                    </select>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
