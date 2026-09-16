/**
 * Content-Disposition header values must be ByteString (Latin-1) — the Fetch/Headers spec
 * throws on any character above U+00FF, which breaks every non-Latin resume/opportunity name
 * (Cyrillic titles in particular). RFC 5987's filename* carries the real UTF-8 name; the plain
 * filename stays as an ASCII-safe fallback for clients that don't support filename*.
 */
export function contentDispositionAttachment(name: string, extension: string): string {
  const asciiFallback =
    name
      .replace(/[^\x00-\x7F]/g, "_")
      .replace(/["\\]/g, "_")
      .slice(0, 100) || "file"
  const utf8Name = encodeURIComponent(name.slice(0, 150))
  return `attachment; filename="${asciiFallback}.${extension}"; filename*=UTF-8''${utf8Name}.${extension}`
}
