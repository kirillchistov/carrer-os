import { describe, expect, it } from "vitest"
import { assertOwned, ownedWhere } from "./with-ownership"
import { NotFoundError } from "@/lib/errors"

describe("assertOwned", () => {
  const owner = "user_1"
  const record = { id: "evidence_1", userId: owner, title: "Launched X" }

  it("returns the record when it belongs to the given user", () => {
    expect(assertOwned(record, owner)).toBe(record)
  })

  it("throws NotFoundError when the record belongs to a different user", () => {
    expect(() => assertOwned(record, "user_2")).toThrow(NotFoundError)
  })

  it("throws NotFoundError when the record is null (e.g. not found by the query)", () => {
    expect(() => assertOwned(null, owner)).toThrow(NotFoundError)
  })

  it("throws NotFoundError when the record is undefined", () => {
    expect(() => assertOwned(undefined, owner)).toThrow(NotFoundError)
  })
})

describe("ownedWhere", () => {
  it("merges userId into an empty where clause", () => {
    expect(ownedWhere("user_1")).toEqual({ userId: "user_1" })
  })

  it("merges userId alongside other filters without overwriting them", () => {
    expect(ownedWhere("user_1", { status: "saved" })).toEqual({
      status: "saved",
      userId: "user_1",
    })
  })

  it("lets userId in the scoping call win if a where clause also set it (defends against a copy-pasted filter)", () => {
    expect(ownedWhere("user_1", { userId: "someone_else" })).toEqual({ userId: "user_1" })
  })
})
