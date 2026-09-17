import type { PoolConfig } from "pg"

export type PostgresHostKind = "supabase_direct" | "supabase_pooler" | "other"

const DEFAULT_SUPABASE_REGION = "eu-west-3"

/**
 * `db.*.supabase.co` is the direct host (often IPv6-only). Vercel serverless
 * cannot reach it. Runtime queries must use the Supabase pooler
 * (`aws-0-<region>.pooler.supabase.com`).
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

function decodePwd(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function databaseName(pathname: string): string {
  const name = pathname.replace(/^\//, "").split("/")[0]
  return name || "postgres"
}

function projectRefFromDirectHost(hostname: string): string | null {
  const match = hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i)
  return match?.[1] ?? null
}

function projectRefFromSupabaseUrl(supabaseUrl: string | undefined): string | null {
  if (!supabaseUrl) return null
  try {
    const host = new URL(supabaseUrl).hostname
    const ref = host.split(".")[0]
    return ref && host.endsWith(".supabase.co") ? ref : null
  } catch {
    return null
  }
}

export type RuntimeDatabaseTarget = {
  host: string
  port: number
  user: string
  password: string
  database: string
  hostKind: PostgresHostKind
  rewritten: boolean
}

/**
 * Turns a Supabase direct URL (IPv6 `db.*`, user `postgres`) into the IPv4
 * pooler URL Prisma can use on Vercel. Strips engine-only `pgbouncer` /
 * `sslmode` params — node-pg currently treats `sslmode=require` as
 * verify-full, which rejects Supabase's certificate chain.
 */
export function resolveRuntimeDatabaseTarget(
  rawUrl: string,
  options?: { region?: string; projectRef?: string }
): RuntimeDatabaseTarget {
  const parsed = new URL(rawUrl)
  const region = options?.region || process.env.SUPABASE_REGION || DEFAULT_SUPABASE_REGION
  const envRef = options?.projectRef || projectRefFromSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const directRef = projectRefFromDirectHost(parsed.hostname)
  const hostKind = postgresHostKind(parsed.hostname)

  let host = parsed.hostname
  let port = parsed.port ? Number(parsed.port) : 5432
  let user = decodePwd(parsed.username)
  const password = decodePwd(parsed.password)
  const database = databaseName(parsed.pathname)
  let rewritten = false

  if (directRef) {
    host = `aws-0-${region}.pooler.supabase.com`
    port = 6543
    if (!user.includes(".")) user = `${user}.${directRef}`
    rewritten = true
  } else if (hostKind === "supabase_pooler" && !user.includes(".")) {
    const ref = envRef
    if (ref) {
      user = `${user}.${ref}`
      rewritten = true
    }
  }

  return {
    host,
    port,
    user,
    password,
    database,
    hostKind: rewritten ? "supabase_pooler" : hostKind,
    rewritten,
  }
}

/**
 * Driver-adapter connection config. Never puts `sslmode` in the URL: pg 8
 * aliases `require` to `verify-full` and then fails on Supabase TLS.
 */
export function prismaPoolConfig(rawUrl: string | undefined, options?: { region?: string; projectRef?: string }): PoolConfig {
  if (!rawUrl) {
    throw new Error("DATABASE_URL is not set")
  }

  let target: RuntimeDatabaseTarget
  try {
    target = resolveRuntimeDatabaseTarget(rawUrl, options)
  } catch {
    return { connectionString: rawUrl, max: 1 }
  }

  const config: PoolConfig = {
    host: target.host,
    port: target.port,
    user: target.user,
    password: target.password,
    database: target.database,
    max: 1,
  }

  if (isSupabasePostgresHost(target.host) || target.hostKind !== "other") {
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
    if (code === "XX000") return { reason: "pooler_tenant", code }
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
  const { reason, code } = describeDbError(error)
  console.error(
    JSON.stringify({
      type: "db_error",
      phase,
      reason,
      code,
      timestamp: new Date().toISOString(),
    })
  )
}
