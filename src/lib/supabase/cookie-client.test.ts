import { describe, expect, it, vi } from "vitest"
import { NextRequest, NextResponse } from "next/server"

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn((_url: string, _key: string, opts: { cookies: { setAll: (c: unknown[]) => void } }) => {
    opts.cookies.setAll([{ name: "sb-access-token", value: "tok", options: { path: "/" } }])
    return { auth: {} }
  }),
}))

describe("createSupabaseCookieClient", () => {
  it("copies pending cookies onto a redirect response", async () => {
    const { createSupabaseCookieClient } = await import("./cookie-client")
    const request = new NextRequest("https://example.com/auth/callback")
    const { applyCookies } = createSupabaseCookieClient(request)

    const response = applyCookies(NextResponse.redirect("https://example.com/dashboard"))
    const setCookie = response.headers.getSetCookie?.() ?? response.headers.get("set-cookie")

    expect(setCookie).toBeTruthy()
    expect(String(setCookie)).toContain("sb-access-token=tok")
  })
})
