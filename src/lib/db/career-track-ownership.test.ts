import { describe, expect, it } from "vitest"
import { assertOwned, ownedWhere } from "./with-ownership"
import { NotFoundError } from "@/lib/errors"

/**
 * career-tracks.ts (src/lib/actions/career-tracks.ts) enforces ownership through the same
 * assertOwned/ownedWhere helpers as every other user-owned model — this test exercises
 * that contract against a CareerTrack-shaped record specifically, since a MAX-3-per-user
 * limit and an AI positioning draft both read a track by id before acting on it, and both
 * must fail closed if the id belongs to someone else.
 */
type CareerTrackFixture = {
  id: string
  userId: string
  title: string
  active: boolean
}

const owner = "user_owner"
const someoneElse = "user_someone_else"

function fixture(overrides: Partial<CareerTrackFixture> = {}): CareerTrackFixture {
  return { id: "track_1", userId: owner, title: "Commercial Director", active: true, ...overrides }
}

describe("career track ownership", () => {
  it("returns the track when the requester is its owner", () => {
    const track = fixture()
    expect(assertOwned(track, owner)).toBe(track)
  })

  it("throws NotFoundError when a different user requests someone else's track", () => {
    const track = fixture()
    expect(() => assertOwned(track, someoneElse)).toThrow(NotFoundError)
  })

  it("throws NotFoundError when the track id does not exist (Prisma findUnique returns null)", () => {
    expect(() => assertOwned(null, owner)).toThrow(NotFoundError)
  })

  it("scopes a list query to the current user via ownedWhere, not a client-supplied filter", () => {
    expect(ownedWhere(owner, { active: true })).toEqual({ active: true, userId: owner })
  })
})
