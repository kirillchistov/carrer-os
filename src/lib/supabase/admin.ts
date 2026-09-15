import "server-only"
import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/env"

/** Service-role client — server-only, bypasses RLS. Never import from client code. */
export function createSupabaseAdminClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured")
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export const DOCUMENTS_BUCKET = "career-os-documents"

let bucketEnsured = false

/** Idempotent — creates the private documents bucket on first use if it doesn't exist yet. */
export async function ensureDocumentsBucket() {
  if (bucketEnsured) return
  const admin = createSupabaseAdminClient()
  const { data: buckets } = await admin.storage.listBuckets()
  if (!buckets?.some((b) => b.name === DOCUMENTS_BUCKET)) {
    await admin.storage.createBucket(DOCUMENTS_BUCKET, { public: false })
  }
  bucketEnsured = true
}
