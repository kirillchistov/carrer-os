import { describe, expect, it } from "vitest"
import {
  describeDbError,
  postgresHostKind,
  prismaPoolConfig,
} from "./connection"

describe("postgresHostKind", () => {
  it("flags the direct db.* host", () => {
    expect(postgresHostKind("db.abcdefgh.supabase.co")).toBe("supabase_direct")
  })

  it("flags the transaction pooler host", () => {
    expect(postgresHostKind("aws-0-eu-central-1.pooler.supabase.com")).toBe("supabase_pooler")
  })

  it("treats localhost as other", () => {
    expect(postgresHostKind("localhost")).toBe("other")
  })
})

describe("prismaPoolConfig", () => {
  it("strips pgbouncer and adds sslmode for Supabase", () => {
    const config = prismaPoolConfig(
      "postgresql://postgres:p%40ss@db.abcdefgh.supabase.co:6543/postgres?pgbouncer=true"
    )
    expect(config.max).toBe(1)
    expect(config.ssl).toEqual({ rejectUnauthorized: false })
    const url = new URL(config.connectionString ?? "")
    expect(url.searchParams.has("pgbouncer")).toBe(false)
    expect(url.searchParams.get("sslmode")).toBe("require")
    expect(decodeURIComponent(url.password)).toBe("p@ss")
  })

  it("leaves a local URL alone (no forced SSL)", () => {
    const config = prismaPoolConfig("postgresql://postgres:postgres@localhost:5432/career_os")
    expect(config.ssl).toBeUndefined()
    expect(config.connectionString).toContain("localhost")
    expect(config.connectionString).not.toContain("sslmode")
  })

  it("throws when DATABASE_URL is missing", () => {
    expect(() => prismaPoolConfig(undefined)).toThrow(/DATABASE_URL/)
  })
})

describe("describeDbError", () => {
  it("maps Prisma P1001 without using the message", () => {
    expect(describeDbError({ code: "P1001", message: "postgresql://secret" })).toEqual({
      reason: "prisma",
      code: "P1001",
    })
  })

  it("maps TLS failures to ssl", () => {
    expect(describeDbError(new Error("self-signed certificate in certificate chain")).reason).toBe(
      "ssl"
    )
  })
})
