import { describe, expect, it } from "vitest"
import { resolveRequestOrigin } from "./origin"

describe("resolveRequestOrigin", () => {
  it("uses the request URL origin outside production", () => {
    const request = new Request("http://localhost:3000/auth/callback")
    expect(resolveRequestOrigin(request, "test")).toBe("http://localhost:3000")
  })

  it("prefers x-forwarded headers in production", () => {
    const request = new Request("http://localhost:3000/auth/callback", {
      headers: {
        "x-forwarded-host": "carrer-os-three.vercel.app",
        "x-forwarded-proto": "https",
      },
    })
    expect(resolveRequestOrigin(request, "production")).toBe("https://carrer-os-three.vercel.app")
  })
})
