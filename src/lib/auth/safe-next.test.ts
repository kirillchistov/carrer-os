import { describe, expect, it } from "vitest"
import { authCallbackUrl, DEFAULT_AFTER_AUTH_PATH, safeNextPath } from "./safe-next"

describe("safeNextPath", () => {
  it("returns the fallback for missing or non-string values", () => {
    expect(safeNextPath(null)).toBe(DEFAULT_AFTER_AUTH_PATH)
    expect(safeNextPath(undefined)).toBe("/dashboard")
    expect(safeNextPath(1)).toBe("/dashboard")
    expect(safeNextPath("")).toBe("/dashboard")
  })

  it("allows in-app relative paths, including query strings", () => {
    expect(safeNextPath("/quick-tailor")).toBe("/quick-tailor")
    expect(safeNextPath("/opportunities/abc?tab=fit")).toBe("/opportunities/abc?tab=fit")
    expect(safeNextPath("/onboarding")).toBe("/onboarding")
    expect(safeNextPath("/reset-password")).toBe("/reset-password")
  })

  it("rejects open redirects and auth loops", () => {
    expect(safeNextPath("https://evil.example")).toBe("/dashboard")
    expect(safeNextPath("//evil.example")).toBe("/dashboard")
    expect(safeNextPath("/\\evil.example")).toBe("/dashboard")
    expect(safeNextPath("/login")).toBe("/dashboard")
    expect(safeNextPath("/signup")).toBe("/dashboard")
    expect(safeNextPath("/auth/callback")).toBe("/dashboard")
    expect(safeNextPath("/forgot-password")).toBe("/dashboard")
    expect(safeNextPath("/account-unavailable")).toBe("/dashboard")
  })
})

describe("authCallbackUrl", () => {
  it("points at /auth/callback on the given origin with a sanitized next", () => {
    expect(authCallbackUrl("https://app.example", "/quick-tailor")).toBe(
      "https://app.example/auth/callback?next=%2Fquick-tailor"
    )
    expect(authCallbackUrl("https://app.example", "https://evil.example")).toBe(
      "https://app.example/auth/callback?next=%2Fdashboard"
    )
  })
})
