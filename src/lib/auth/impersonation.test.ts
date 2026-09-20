import { describe, expect, it } from "vitest"
import { canImpersonate, isUuid } from "./impersonation"

describe("canImpersonate", () => {
  const admin = { id: "11111111-1111-4111-8111-111111111111", role: "admin" as const }
  const user = { id: "22222222-2222-4222-8222-222222222222", role: "user" as const }

  it("allows an admin to open a regular user", () => {
    expect(canImpersonate(admin, user)).toBe(true)
  })

  it("does not allow impersonating another admin or yourself", () => {
    expect(canImpersonate(admin, admin)).toBe(false)
    expect(canImpersonate(admin, { ...user, role: "admin" })).toBe(false)
    expect(canImpersonate(user, admin)).toBe(false)
    expect(canImpersonate(admin, null)).toBe(false)
  })
})

describe("isUuid", () => {
  it("accepts a v4 uuid", () => {
    expect(isUuid("2c9c3c1a-4b6e-4f3a-9d2b-7a1e5c8f0d11")).toBe(true)
  })

  it("rejects junk", () => {
    expect(isUuid("not-a-uuid")).toBe(false)
    expect(isUuid("")).toBe(false)
  })
})
