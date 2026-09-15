import "server-only"
import dns from "node:dns/promises"
import { isIP } from "node:net"

const FETCH_TIMEOUT_MS = 8000
const MAX_BYTES = 3 * 1024 * 1024

export class UnsafeUrlError extends Error {}

function isPrivateOrReservedIPv4(address: string): boolean {
  const parts = address.split(".").map(Number)
  const [a, b] = parts
  if (a === 10) return true
  if (a === 127) return true
  if (a === 0) return true
  if (a === 169 && b === 254) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 100 && b >= 64 && b <= 127) return true // carrier-grade NAT
  return false
}

function isPrivateOrReservedIPv6(address: string): boolean {
  const normalized = address.toLowerCase()
  if (normalized === "::1") return true
  if (normalized.startsWith("fe80:")) return true // link-local
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true // unique local
  if (normalized.startsWith("::ffff:")) {
    // IPv4-mapped IPv6 — check the embedded IPv4 address too
    return isPrivateOrReservedIPv4(normalized.replace("::ffff:", ""))
  }
  return false
}

function isPrivateOrReservedIP(address: string): boolean {
  const version = isIP(address)
  if (version === 4) return isPrivateOrReservedIPv4(address)
  if (version === 6) return isPrivateOrReservedIPv6(address)
  return true // not a recognizable IP — treat as unsafe
}

/**
 * Best-effort SSRF guard for user-supplied URLs (opportunity import "insert a link").
 * Resolves the hostname and rejects private/loopback/link-local targets. This mitigates
 * the common case but is not resistant to DNS-rebinding between this check and the actual
 * fetch (that would need a custom dispatcher pinned to the resolved IP) — acceptable for
 * an MVP feature that never automates login or bypasses access controls, but worth
 * revisiting before this endpoint sees adversarial traffic.
 */
async function assertSafeUrl(rawUrl: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new UnsafeUrlError("Некорректная ссылка")
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new UnsafeUrlError("Поддерживаются только http и https ссылки")
  }
  if (url.hostname === "localhost" || url.hostname === "0.0.0.0") {
    throw new UnsafeUrlError("Недопустимый адрес")
  }

  let addresses: { address: string }[]
  try {
    addresses = await dns.lookup(url.hostname, { all: true })
  } catch {
    throw new UnsafeUrlError("Не удалось разрешить адрес")
  }
  if (addresses.length === 0 || addresses.some((a) => isPrivateOrReservedIP(a.address))) {
    throw new UnsafeUrlError("Недопустимый адрес")
  }

  return url
}

export type FetchedPage = { html: string; finalUrl: string }

export async function fetchPageHtml(rawUrl: string): Promise<FetchedPage> {
  const url = await assertSafeUrl(rawUrl)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CareerEvidenceOS/1.0; +https://career-evidence-os.example)",
        Accept: "text/html,application/xhtml+xml",
      },
    })

    if (!response.ok) {
      throw new UnsafeUrlError(`Страница вернула ошибку ${response.status}`)
    }
    const contentType = response.headers.get("content-type") ?? ""
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      throw new UnsafeUrlError("Страница не содержит HTML-контент")
    }

    const reader = response.body?.getReader()
    if (!reader) throw new UnsafeUrlError("Не удалось прочитать содержимое страницы")

    const chunks: Uint8Array[] = []
    let total = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > MAX_BYTES) {
        await reader.cancel()
        throw new UnsafeUrlError("Страница слишком большая")
      }
      chunks.push(value)
    }

    const html = Buffer.concat(chunks).toString("utf-8")
    return { html, finalUrl: response.url || url.toString() }
  } finally {
    clearTimeout(timeout)
  }
}
