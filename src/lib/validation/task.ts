import { z } from "zod"
import { taskPrioritySchema } from "./enums"

export const taskFormSchema = z.object({
  title: z.string().min(1, "Укажите задачу"),
  description: z.string().nullable(),
  dueAt: z.string().nullable(),
  priority: taskPrioritySchema,
})

export type TaskFormValues = z.infer<typeof taskFormSchema>

export const taskFormDefaults: TaskFormValues = {
  title: "",
  description: null,
  dueAt: null,
  priority: "medium",
}
