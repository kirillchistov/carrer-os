/**
 * Privacy-first product analytics: event name + IDs/enums/numbers only. Never pass resume
 * text, evidence content, notes, or any other free-form user content here — see
 * docs/product-plan.md, "Observability".
 */
export type ProductEvent =
  | "onboarding_completed"
  | "experience_imported"
  | "evidence_created"
  | "career_track_created"
  | "opportunity_created"
  | "fit_report_generated"
  | "resume_change_accepted"
  | "resume_exported"
  | "application_stage_changed"
  | "interview_note_created"
  | "quick_tailor_generated"
  | "quick_tailor_match_generated"
  | "landing_cta_click"
  | "try_started"
  | "try_generated"
  | "signup_from_try"

type EventProperties = Record<string, string | number | boolean | null | undefined>

const ANON_ID = "anon"

function posthogKey() {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY
}

function posthogHost() {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com"
}

export function track(event: ProductEvent, userId: string = ANON_ID, properties?: EventProperties) {
  const payload = {
    type: "product_event",
    event,
    userId,
    ...properties,
    timestamp: new Date().toISOString(),
  }

  console.log(JSON.stringify(payload))

  const key = posthogKey()
  if (!key) return

  void import("posthog-node")
    .then(({ PostHog }) => {
      const client = new PostHog(key, { host: posthogHost() })
      client.capture({ distinctId: userId, event, properties: properties ?? {} })
      return client.shutdown()
    })
    .catch(() => undefined)
}
