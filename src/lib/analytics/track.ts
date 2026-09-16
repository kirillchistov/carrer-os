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

type EventProperties = Record<string, string | number | boolean | null | undefined>

export function track(event: ProductEvent, userId: string, properties?: EventProperties) {
  const payload = {
    type: "product_event",
    event,
    userId,
    ...properties,
    timestamp: new Date().toISOString(),
  }

  // Swap for a real analytics sink (e.g. PostHog, Amplitude) once one is configured —
  // this structured log line is the whole "no-op until keys present" implementation.
  console.log(JSON.stringify(payload))
}
