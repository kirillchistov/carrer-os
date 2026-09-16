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

export const fitDimensionSchema = z.enum([
  "role_fit",
  "industry_fit",
  "business_problem_fit",
  "leadership_scale_fit",
  "skills_tools_fit",
  "employment_format_fit",
  "logistics_fit",
  "evidence_strength_fit",
  "motivation_risk_fit",
  "freshness_fit",
])
export const fitDimensionStatusSchema = z.enum(["strong", "partial", "gap", "unknown"])
export const fitOverallLabelSchema = z.enum(["strong_fit", "partial_fit", "weak_fit", "unknown"])

export const resumeChangeTypeSchema = z.enum(["add", "remove", "rewrite", "reorder"])
export const applicationChannelSchema = z.enum([
  "direct_apply",
  "referral",
  "recruiter_outreach",
  "inbound",
  "other",
])
