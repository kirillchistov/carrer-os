import { z } from "zod"

export const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
})

export type Env = z.infer<typeof envSchema> & { NEXT_PUBLIC_APP_URL: string }

const LOCAL_APP_URL = "http://localhost:3000"

export function resolveAppUrl(value: string | undefined, nodeEnv: string | undefined): string {
  const isProd = nodeEnv === "production"
  if (!value) {
    if (isProd) {
      throw new Error("NEXT_PUBLIC_APP_URL is required in production")
    }
    return LOCAL_APP_URL
  }

  if (isProd) {
    let parsed: URL
    try {
      parsed = new URL(value)
    } catch {
      throw new Error("NEXT_PUBLIC_APP_URL must be a valid URL")
    }
    const host = parsed.hostname
    if (parsed.protocol !== "https:" || host === "localhost" || host === "127.0.0.1") {
      throw new Error("NEXT_PUBLIC_APP_URL must be a public https URL in production")
    }
  }

  return value
}

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    throw new Error(`Invalid environment variables:\n${parsed.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`).join("\n")}`)
  }
  return {
    ...parsed.data,
    NEXT_PUBLIC_APP_URL: resolveAppUrl(parsed.data.NEXT_PUBLIC_APP_URL, process.env.NODE_ENV),
  }
}

export const env = loadEnv()
