"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requireCurrentUser } from "@/lib/auth/session"
import { assertOwned } from "@/lib/db/with-ownership"
import { taskFormSchema, type TaskFormValues } from "@/lib/validation/task"

export async function listOpportunityTasks(opportunityId: string) {
  const user = await requireCurrentUser()
  return prisma.task.findMany({
    where: { userId: user.id, opportunityId },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }],
  })
}

export async function createOpportunityTask(opportunityId: string, values: TaskFormValues) {
  const user = await requireCurrentUser()
  assertOwned(await prisma.opportunity.findUnique({ where: { id: opportunityId } }), user.id)

  const data = taskFormSchema.parse(values)
  await prisma.task.create({
    data: {
      userId: user.id,
      opportunityId,
      title: data.title,
      description: data.description,
      dueAt: data.dueAt ? new Date(data.dueAt) : null,
      priority: data.priority,
      status: "open",
    },
  })

  revalidatePath(`/opportunities/${opportunityId}`)
  return { ok: true as const }
}

export async function toggleTaskDone(id: string) {
  const user = await requireCurrentUser()
  const task = assertOwned(await prisma.task.findUnique({ where: { id } }), user.id)

  await prisma.task.update({ where: { id }, data: { status: task.status === "done" ? "open" : "done" } })
  if (task.opportunityId) revalidatePath(`/opportunities/${task.opportunityId}`)
  return { ok: true as const }
}

export async function deleteTask(id: string) {
  const user = await requireCurrentUser()
  const task = assertOwned(await prisma.task.findUnique({ where: { id } }), user.id)

  await prisma.task.delete({ where: { id } })
  if (task.opportunityId) revalidatePath(`/opportunities/${task.opportunityId}`)
  return { ok: true as const }
}
