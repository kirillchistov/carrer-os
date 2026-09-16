import type { ProposedChange } from "@/lib/validation/resume-proposal"

const VALID_SECTION_RE = /^(summary|achievements|skills|certifications|projects|experience\.\d+)$/

/**
 * Defensive post-processing before persisting AI-proposed resume changes: drops any
 * cited evidence/experience id that wasn't actually in the set given to the model, and
 * drops whole proposals that target a section the model wasn't told about (a
 * hallucinated section is a proposal we can't safely apply — see apply-proposal.ts's
 * no-op fallback, which this keeps out of the review list entirely rather than
 * silently no-op'ing on Accept).
 */
export function sanitizeResumeProposals(proposals: ProposedChange[], allowedIds: Set<string>): ProposedChange[] {
  return proposals
    .filter((p) => VALID_SECTION_RE.test(p.section))
    .map((p) => ({ ...p, evidenceIds: p.evidenceIds.filter((id) => allowedIds.has(id)) }))
}
