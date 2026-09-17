import { describe, expect, it } from "vitest"
import {
  describeDbError,
  postgresHostKind,
  prismaPoolConfig,
  resolveRuntimeDatabaseTarget,
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

describe("resolveRuntimeDatabaseTarget", () => {
  it("rewrites the IPv6-only db.* host to the transaction pooler", () => {
    const target = resolveRuntimeDatabaseTarget(
      "postgresql://postgres:p%40ss@db.abcdefgh.supabase.co:6543/postgres?pgbouncer=true",
      { region: "eu-west-3" }
    )
    expect(target).toMatchObject({
      host: "aws-0-eu-west-3.pooler.supabase.com",
      port: 6543,
      user: "postgres.abcdefgh",
      password: "p@ss",
      database: "postgres",
      hostKind: "supabase_pooler",
      rewritten: true,
    })
  })

  it("adds the project-ref tenant to a pooler URL that still uses postgres", () => {
    const target = resolveRuntimeDatabaseTarget(
      "postgresql://postgres:secret@aws-0-eu-west-3.pooler.supabase.com:6543/postgres",
      { projectRef: "abcdefgh" }
    )
    expect(target.user).toBe("postgres.abcdefgh")
    expect(target.rewritten).toBe(true)
  })

  it("leaves an already-correct pooler URL alone", () => {
    const target = resolveRuntimeDatabaseTarget(
      "postgresql://postgres.abcdefgh:secret@aws-0-eu-west-3.pooler.supabase.com:6543/postgres"
    )
    expect(target.user).toBe("postgres.abcdefgh")
    expect(target.host).toBe("aws-0-eu-west-3.pooler.supabase.com")
    expect(target.rewritten).toBe(false)
  })
})

describe("prismaPoolConfig", () => {
  it("uses discrete fields and Supabase TLS without sslmode in a URL", () => {
    const config = prismaPoolConfig(
      "postgresql://postgres:p%40ss@db.abcdefgh.supabase.co:6543/postgres?pgbouncer=true",
      { region: "eu-west-3" }
    )
    expect(config.connectionString).toBeUndefined()
    expect(config.host).toBe("aws-0-eu-west-3.pooler.supabase.com")
    expect(config.user).toBe("postgres.abcdefgh")
    expect(config.password).toBe("p@ss")
    expect(config.max).toBe(1)
    expect(config.ssl).toEqual({ rejectUnauthorized: false })
  })

  it("leaves a local URL alone (no forced SSL)", () => {
    const config = prismaPoolConfig("postgresql://postgres:postgres@localhost:5432/career_os")
    expect(config.ssl).toBeUndefined()
    expect(config.host).toBe("localhost")
    expect(config.port).toBe(5432)
    expect(config.database).toBe("career_os")
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

  it("maps a missing pooler tenant to pooler_tenant", () => {
    expect(describeDbError({ code: "XX000", message: "no tenant identifier provided" }).reason).toBe(
      "pooler_tenant"
    )
  })
})
