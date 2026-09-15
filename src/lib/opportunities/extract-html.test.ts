import { describe, expect, it } from "vitest"
import { extractOgMetadata, stripHtmlToText } from "./extract-html"

describe("extractOgMetadata", () => {
  it("reads og:title and og:description when present", () => {
    const html = `
      <html><head>
        <meta property="og:title" content="Head of Growth at Acme" />
        <meta property="og:description" content="Remote, full-time" />
        <title>Fallback Title</title>
      </head></html>
    `
    const meta = extractOgMetadata(html)
    expect(meta.title).toBe("Head of Growth at Acme")
    expect(meta.description).toBe("Remote, full-time")
  })

  it("falls back to <title> when no og:title is present", () => {
    const html = `<html><head><title>Plain Title</title></head></html>`
    expect(extractOgMetadata(html).title).toBe("Plain Title")
  })

  it("falls back to <meta name=description> when og:description is absent", () => {
    const html = `<html><head><meta name="description" content="A vacancy page" /></head></html>`
    expect(extractOgMetadata(html).description).toBe("A vacancy page")
  })

  it("decodes HTML entities in extracted metadata", () => {
    const html = `<meta property="og:title" content="Sales &amp; Marketing Lead" />`
    expect(extractOgMetadata(html).title).toBe("Sales & Marketing Lead")
  })

  it("returns null fields when nothing is found", () => {
    const meta = extractOgMetadata("<html><body>no head</body></html>")
    expect(meta.title).toBeNull()
    expect(meta.description).toBeNull()
    expect(meta.siteName).toBeNull()
  })
})

describe("stripHtmlToText", () => {
  it("removes script and style content entirely", () => {
    const html = `<html><body><script>alert('x')</script><style>.a{color:red}</style><p>Hello</p></body></html>`
    const text = stripHtmlToText(html)
    expect(text).toBe("Hello")
  })

  it("converts block-level closing tags into line breaks", () => {
    const html = "<p>First</p><p>Second</p>"
    expect(stripHtmlToText(html)).toBe("First\nSecond")
  })

  it("strips remaining tags and collapses whitespace", () => {
    const html = "<div>Hello <b>world</b>   !</div>"
    expect(stripHtmlToText(html)).toBe("Hello world !")
  })

  it("truncates very long content to the max length", () => {
    const html = `<p>${"x".repeat(20000)}</p>`
    expect(stripHtmlToText(html).length).toBeLessThanOrEqual(15000)
  })
})
