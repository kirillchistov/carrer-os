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
