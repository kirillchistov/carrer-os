"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import type { Task } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { createOpportunityTask, deleteTask, toggleTaskDone } from "@/lib/actions/tasks"
import { cn } from "cn"

export function OpportunityTasks({ opportunityId, tasks }: { opportunityId: string; tasks: Task[] }) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [pending, startTransition] = useTransition()

  function addTask() {
    if (!title.trim()) return
    startTransition(async () => {
      await createOpportunityTask(opportunityId, { title: title.trim(), description: null, dueAt: null, priority: "medium" })
      setTitle("")
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Задачи</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2">
            <Checkbox
              checked={task.status === "done"}
              onCheckedChange={() =>
                startTransition(async () => {
                  await toggleTaskDone(task.id)
                  router.refresh()
                })
              }
            />
            <span className={cn("flex-1 text-sm", task.status === "done" && "text-muted-foreground line-through")}>
              {task.title}
            </span>
            <Button
              size="icon"
              variant="ghost"
              disabled={pending}
              aria-label="Удалить задачу"
              onClick={() =>
                startTransition(async () => {
                  await deleteTask(task.id)
                  router.refresh()
                })
              }
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-sm text-muted-foreground">Задач пока нет.</p>}
        <div className="flex gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTask())}
            placeholder="Новая задача"
          />
          <Button
            size="icon"
            variant="outline"
            disabled={pending || !title.trim()}
            aria-label="Добавить задачу"
            onClick={addTask}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
