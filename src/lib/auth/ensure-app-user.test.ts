import { beforeEach, describe, expect, it, vi } from "vitest"
import { ProfileProvisioningError } from "@/lib/errors"

const { findUnique, creditCreate, transaction } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  creditCreate: vi.fn(),
  transaction: vi.fn(),
}))

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: { findUnique },
    creditAccount: { create: creditCreate },
    $transaction: transaction,
  },
}))

vi.mock("@/lib/auth/log", () => ({
  logAuthEvent: vi.fn(),
}))

vi.mock("@/lib/db/connection", () => ({
  logDbError: vi.fn(),
}))

import { ensureAppUser } from "./ensure-app-user"

describe("ensureAppUser", () => {
  beforeEach(() => {
    findUnique.mockReset()
    creditCreate.mockReset()
    transaction.mockReset()
  })

  it("returns an existing user", async () => {
    findUnique.mockResolvedValueOnce({
      id: "u1",
      email: "a@b.c",
      creditAccount: { id: "c1" },
    })
    await expect(ensureAppUser({ id: "u1", email: "a@b.c" })).resolves.toMatchObject({ id: "u1" })
    expect(transaction).not.toHaveBeenCalled()
  })

  it("turns a database outage into ProfileProvisioningError", async () => {
    findUnique.mockRejectedValueOnce(Object.assign(new Error("Can't reach database"), { code: "P1001" }))
    await expect(ensureAppUser({ id: "u1", email: "a@b.c" })).rejects.toBeInstanceOf(
      ProfileProvisioningError
    )
  })
})
