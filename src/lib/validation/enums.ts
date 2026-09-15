import { z } from "zod"

export const localeSchema = z.enum(["ru", "en", "es"])
export const employmentFormatSchema = z.enum([
  "permanent",
  "contract",
  "project",
  "fractional",
  "advisory",
])
export const workModeSchema = z.enum(["onsite", "hybrid", "remote"])
export const confidenceLevelSchema = z.enum(["low", "medium", "high"])

export const opportunityTypeSchema = z.enum([
  "vacancy",
  "project",
  "fractional",
  "advisory",
  "proactive_lead",
])

export const opportunityStatusSchema = z.enum([
  "saved",
  "researching",
  "ready_to_apply",
  "applied",
  "recruiter_screen",
  "hiring_manager",
  "case_test_task",
  "final_interview",
  "offer",
  "rejected",
  "withdrawn",
  "paused",
])

export const requirementCategorySchema = z.enum([
  "responsibility",
  "skill",
  "tool",
  "qualification",
  "industry_experience",
  "logistics",
  "other",
])

export const requirementImportanceSchema = z.enum(["must_have", "nice_to_have", "inferred_context"])

export const taskPrioritySchema = z.enum(["low", "medium", "high"])
export const taskStatusSchema = z.enum(["open", "in_progress", "done", "cancelled"])
