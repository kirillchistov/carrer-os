import { describe, expect, it } from "vitest"
import { envSchema } from "./env"

const validEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://xxxx.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  DATABASE_URL: "postgresql://user:pass@host:6543/postgres",
}

describe("envSchema", () => {
  it("accepts the minimal required set of variables", () => {
    const result = envSchema.safeParse(validEnv)
    expect(result.success).toBe(true)
  })

  it("defaults NEXT_PUBLIC_APP_URL when not provided", () => {
    const result = envSchema.parse(validEnv)
    expect(result.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000")
  })

  it("rejects a missing DATABASE_URL", () => {
    const rest: Partial<typeof validEnv> = { ...validEnv }
    delete rest.DATABASE_URL
    const result = envSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it("rejects a non-URL NEXT_PUBLIC_SUPABASE_URL", () => {
    const result = envSchema.safeParse({ ...validEnv, NEXT_PUBLIC_SUPABASE_URL: "not-a-url" })
    expect(result.success).toBe(false)
  })

  it("treats SUPABASE_SERVICE_ROLE_KEY as optional (server-only, not always present client-side)", () => {
    const result = envSchema.safeParse(validEnv)
    expect(result.success).toBe(true)
  })
})
