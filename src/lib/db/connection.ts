import type { PoolConfig } from "pg"

export type PostgresHostKind = "supabase_direct" | "supabase_pooler" | "other"

/**
 * `db.*.supabase.co` is the direct host (often IPv6-only). Vercel serverless
 * cannot reach it. Runtime queries must use the Transaction pooler
 * (`*.pooler.supabase.com:6543`).
 */
export function postgresHostKind(hostname: string): PostgresHostKind {
  const host = hostname.toLowerCase()
  if (host.includes("pooler.supabase")) return "supabase_pooler"
  if (host.endsWith(".supabase.co") || host.endsWith(".supabase.com")) return "supabase_direct"
  return "other"
}

export function isSupabasePostgresHost(hostname: string): boolean {
  return postgresHostKind(hostname) !== "other"
}

function hostnameFrom(rawUrl: string): string | null {
  try {
    return new URL(rawUrl).hostname
  } catch {
    return null
  }
}

/**
 * Driver-adapter connection config. Strips Prisma-engine-only `pgbouncer=true`
 * (node-pg does not understand it) and forces TLS for Supabase hosts.
 */
export function prismaPoolConfig(rawUrl: string | undefined): PoolConfig {
  if (!rawUrl) {
    throw new Error("DATABASE_URL is not set")
  }

  let connectionString = rawUrl
  let hostname = hostnameFrom(rawUrl)

  try {
    const parsed = new URL(rawUrl)
    parsed.searchParams.delete("pgbouncer")
    hostname = parsed.hostname
    if (isSupabasePostgresHost(parsed.hostname) && !parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require")
    }
    connectionString = parsed.toString()
  } catch {
    connectionString = rawUrl
  }

  const config: PoolConfig = {
    connectionString,
    max: 1,
  }

  if (hostname && isSupabasePostgresHost(hostname)) {
    config.ssl = { rejectUnauthorized: false }
  }

  return config
}

export function describeDbError(error: unknown): { reason: string; code: string | null } {
  if (error instanceof Error && /ssl|certificate/i.test(error.message)) {
    return { reason: "ssl", code: null }
  }
  if (error && typeof error === "object") {
    const code = "code" in error && typeof (error as { code: unknown }).code === "string"
      ? (error as { code: string }).code
      : null
    if (code === "ENOTFOUND" || code === "ECONNREFUSED" || code === "ETIMEDOUT" || code === "EHOSTUNREACH") {
      return { reason: "db_connect", code }
    }
    if (code && /^P\d+$/.test(code)) return { reason: "prisma", code }
    if (code) return { reason: "driver", code }
    const name = "name" in error && typeof (error as { name: unknown }).name === "string"
      ? (error as { name: string }).name
      : null
    if (name) return { reason: name, code: null }
  }
  return { reason: "unknown", code: null }
}

export function logDbError(error: unknown, phase: "pool" | "query") {
  const hostname = hostnameFrom(process.env.DATABASE_URL ?? "")
  const { reason, code } = describeDbError(error)
  console.error(
    JSON.stringify({
      type: "db_error",
      phase,
      reason,
      code,
      hostKind: hostname ? postgresHostKind(hostname) : null,
      timestamp: new Date().toISOString(),
    })
  )
}
