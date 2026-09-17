import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CtaLink } from "./cta-link"

describe("CtaLink", () => {
  it("renders a real link, not a button", () => {
    render(<CtaLink href="/try">Адаптировать резюме</CtaLink>)
    const link = screen.getByRole("link", { name: "Адаптировать резюме" })
    expect(link.tagName).toBe("A")
    expect(link.getAttribute("href")).toBe("/try")
  })
})
