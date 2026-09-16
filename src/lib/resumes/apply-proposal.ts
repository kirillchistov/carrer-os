import type { ResumeContent } from "@/lib/validation/resume"

export type ProposalPatch = {
  section: string
  changeType: string
  originalText: string | null
  proposedText: string
}

const EXPERIENCE_SECTION_RE = /^experience\.(\d+)$/

function applyListChange(list: string[], patch: ProposalPatch): string[] {
  if (patch.changeType === "add") return [...list, patch.proposedText]
  if (patch.changeType === "remove") return list.filter((item) => item !== patch.originalText)
  // "rewrite" (and anything else): replace the matching item, or append if no match found
  const index = list.findIndex((item) => item === patch.originalText)
  if (index === -1) return [...list, patch.proposedText]
  const next = [...list]
  next[index] = patch.proposedText
  return next
}

/**
 * Applies one accepted resume-change proposal to the resume's structured content.
 * Pure and total: an unrecognized section is a no-op rather than throwing, since this
 * runs on user-triggered "Accept" clicks where surfacing a silent no-op beats crashing
 * the editor over a malformed AI-authored section string.
 */
export function applyProposal(content: ResumeContent, patch: ProposalPatch): ResumeContent {
  if (patch.section === "summary") {
    return { ...content, summary: patch.proposedText }
  }
  if (patch.section === "skills") {
    return { ...content, skills: applyListChange(content.skills, patch) }
  }
  if (patch.section === "achievements") {
    return { ...content, achievements: applyListChange(content.achievements, patch) }
  }
  if (patch.section === "certifications") {
    return { ...content, certifications: applyListChange(content.certifications, patch) }
  }
  if (patch.section === "projects") {
    return { ...content, projects: applyListChange(content.projects, patch) }
  }

  const experienceMatch = EXPERIENCE_SECTION_RE.exec(patch.section)
  if (experienceMatch) {
    const index = Number(experienceMatch[1])
    const entry = content.experience[index]
    if (!entry) return content
    const experience = [...content.experience]
    experience[index] = { ...entry, bullets: applyListChange(entry.bullets, patch) }
    return { ...content, experience }
  }

  return content
}
