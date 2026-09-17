import { describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { isProtectedPath } from "@/lib/auth/paths"

const { getUser } = vi.hoisted(() => ({
  getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
}))

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser },
  })),
}))

vi.mock("@/lib/auth/log", () => ({
  logAuthEvent: vi.fn(),
}))

describe("isProtectedPath", () => {
  it.each([
    "/dashboard",
    "/dashboard/",
    "/profile/experience",
    "/evidence/new",
    "/tracks/track_1",
    "/resumes/resume_1/versions/v1",
    "/opportunities",
    "/pipeline",
    "/settings",
    "/onboarding",
    "/quick-tailor",
    "/quick-tailor/",
    "/interviews/abc",
    "/resources",
  ])("treats %s as protected", (path) => {
    expect(isProtectedPath(path)).toBe(true)
  })

  it.each([
    "/",
    "/login",
    "/signup",
    "/try",
    "/privacy",
    "/terms",
    "/auth/callback",
    "/forgot-password",
    "/reset-password",
    "/account-unavailable",
  ])("treats %s as public", (path) => {
    expect(isProtectedPath(path)).toBe(false)
  })

  it("does not treat a similar prefix as protected", () => {
    expect(isProtectedPath("/tracksuit")).toBe(false)
    expect(isProtectedPath("/dashboarding")).toBe(false)
  })
})

describe("updateSupabaseSession", () => {
  it("redirects an unauthenticated request away from a protected route", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null }, error: null })
    const { updateSupabaseSession } = await import("./middleware")
    const request = new NextRequest("http://localhost:3000/dashboard")

    const response = await updateSupabaseSession(request)

    expect(response.status).toBe(307)
    const location = new URL(response.headers.get("location") ?? "")
    expect(location.pathname).toBe("/login")
    expect(location.searchParams.get("next")).toBe("/dashboard")
  })

  it("includes the original query string in next", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null }, error: null })
    const { updateSupabaseSession } = await import("./middleware")
    const request = new NextRequest("http://localhost:3000/opportunities/abc?tab=fit")

    const response = await updateSupabaseSession(request)
    const location = new URL(response.headers.get("location") ?? "")
    expect(location.searchParams.get("next")).toBe("/opportunities/abc?tab=fit")
  })

  it("redirects unauthenticated /quick-tailor to login", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null }, error: null })
    const { updateSupabaseSession } = await import("./middleware")
    const request = new NextRequest("http://localhost:3000/quick-tailor")

    const response = await updateSupabaseSession(request)

    expect(response.status).toBe(307)
    const location = new URL(response.headers.get("location") ?? "")
    expect(location.pathname).toBe("/login")
    expect(location.searchParams.get("next")).toBe("/quick-tailor")
  })

  it("passes through an unauthenticated request to a public route", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null }, error: null })
    const { updateSupabaseSession } = await import("./middleware")
    const request = new NextRequest("http://localhost:3000/login")

    const response = await updateSupabaseSession(request)

    expect(response.headers.get("location")).toBeNull()
  })

  it("redirects to login instead of throwing when getUser fails", async () => {
    getUser.mockRejectedValueOnce(Object.assign(new Error("over_request_rate_limit"), { status: 429 }))
    const { updateSupabaseSession } = await import("./middleware")
    const request = new NextRequest("http://localhost:3000/dashboard")

    const response = await updateSupabaseSession(request)

    expect(response.status).toBe(307)
    const location = new URL(response.headers.get("location") ?? "")
    expect(location.pathname).toBe("/login")
  })
})
