import { describe, expect, it } from "vitest"
import { envSchema, resolveAppUrl } from "./env"

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

describe("resolveAppUrl", () => {
  it("defaults to localhost outside production", () => {
    expect(resolveAppUrl(undefined, "development")).toBe("http://localhost:3000")
    expect(resolveAppUrl(undefined, "test")).toBe("http://localhost:3000")
  })

  it("requires a public https URL in production", () => {
    expect(() => resolveAppUrl(undefined, "production")).toThrow(/required in production/)
    expect(() => resolveAppUrl("http://localhost:3000", "production")).toThrow(/public https/)
    expect(() => resolveAppUrl("https://localhost:3000", "production")).toThrow(/public https/)
    expect(resolveAppUrl("https://carrer-os-three.vercel.app", "production")).toBe(
      "https://carrer-os-three.vercel.app"
    )
  })
})
