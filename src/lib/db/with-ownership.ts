import { NotFoundError } from "@/lib/errors"

/**
 * Prisma connects with a privileged role and does not evaluate Postgres RLS as the
 * end user (see docs/product-plan.md, "Ownership model"). Every read/write of a
 * user-owned entity MUST go through one of these two patterns so a missing scope
 * fails closed instead of silently leaking another user's data:
 *
 * 1. Prefer scoping the query itself: `prisma.evidence.findFirst({ where: { id, userId } })`
 *    combined with `assertOwned()` on the result.
 * 2. When a record was fetched via a relation that can't carry `userId` in its own
 *    `where` (e.g. through a join), fetch the record and call `assertOwned()` before
 *    using or returning it.
 */
export function assertOwned<T extends { userId: string }>(
  record: T | null | undefined,
  userId: string
): T {
  if (!record || record.userId !== userId) {
    throw new NotFoundError()
  }
  return record
}

/** Merges the current user's id into a Prisma `where` clause — use at every call site
 *  that queries a user-owned model, so the scope is never accidentally left out. */
export function ownedWhere<W extends Record<string, unknown>>(
  userId: string,
  where: W = {} as W
): W & { userId: string } {
  return { ...where, userId }
}
