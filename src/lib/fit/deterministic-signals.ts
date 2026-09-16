/**
 * Pure, deterministic facts computed from the candidate's data and the opportunity —
 * handed to the AI as ground truth it must not contradict (see
 * src/lib/ai/tasks/generate-fit-assessment.ts). This is the "rules" half of the hybrid
 * rules+LLM design in docs/product-plan.md §11: keyword/format/location matching is
 * exact and reproducible, not left to the model to eyeball.
 */

export type RequirementInput = {
  id: string
  category: string
  text: string
  importance: string
  normalizedSkill: string | null
}

export type EvidenceInput = {
  id: string
  title: string
  skills: string[]
  industries: string[]
  qualityScore: number | null
}

export type DeterministicSignalsInput = {
  opportunity: {
    employmentFormat: string | null
    workMode: string | null
    location: string | null
  }
  requirements: RequirementInput[]
  careerTrack: {
    employmentFormats: string[]
    targetIndustries: string[]
  }
  profile: {
    targetWorkModes: string[]
    targetLocations: string[]
  } | null
  skillNames: string[]
  evidence: EvidenceInput[]
}

export type SkillMatch = {
  requirementId: string
  text: string
  matched: boolean
}

export type DeterministicSignals = {
  employmentFormatMatch: boolean | null
  workModeMatch: boolean | null
  locationMatch: boolean | null
  skillMatches: SkillMatch[]
  matchedSkillCount: number
  missingSkillCount: number
  evidenceCountForTrack: number
  averageEvidenceQuality: number | null
  industryOverlap: boolean | null
}

function normalize(text: string): string {
  return text.trim().toLowerCase()
}

function fuzzyIncludes(haystack: string, needle: string): boolean {
  const h = normalize(haystack)
  const n = normalize(needle)
  return h.includes(n) || n.includes(h)
}

export function computeDeterministicSignals(input: DeterministicSignalsInput): DeterministicSignals {
  const { opportunity, requirements, careerTrack, profile, skillNames, evidence } = input

  const employmentFormatMatch = opportunity.employmentFormat
    ? careerTrack.employmentFormats.includes(opportunity.employmentFormat)
    : null

  const workModeMatch =
    opportunity.workMode && profile && profile.targetWorkModes.length > 0
      ? profile.targetWorkModes.includes(opportunity.workMode)
      : null

  const locationMatch =
    opportunity.location && profile && profile.targetLocations.length > 0
      ? profile.targetLocations.some((loc) => fuzzyIncludes(opportunity.location as string, loc))
      : null

  const candidateSkillPool = [...skillNames, ...evidence.flatMap((e) => e.skills)]

  const skillRequirements = requirements.filter((r) => r.category === "skill" || r.category === "tool")
  const skillMatches: SkillMatch[] = skillRequirements.map((req) => {
    const label = req.normalizedSkill ?? req.text
    return {
      requirementId: req.id,
      text: label,
      matched: candidateSkillPool.some((skill) => fuzzyIncludes(skill, label)),
    }
  })

  const industryRequirementTexts = requirements
    .filter((r) => r.category === "industry_experience")
    .map((r) => r.normalizedSkill ?? r.text)
  const industryOverlap =
    industryRequirementTexts.length > 0
      ? industryRequirementTexts.some((reqIndustry) =>
          careerTrack.targetIndustries.some((ti) => fuzzyIncludes(ti, reqIndustry))
        )
      : null

  const qualityScores = evidence.map((e) => e.qualityScore).filter((s): s is number => s !== null)

  return {
    employmentFormatMatch,
    workModeMatch,
    locationMatch,
    skillMatches,
    matchedSkillCount: skillMatches.filter((m) => m.matched).length,
    missingSkillCount: skillMatches.filter((m) => !m.matched).length,
    evidenceCountForTrack: evidence.length,
    averageEvidenceQuality:
      qualityScores.length > 0 ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length) : null,
    industryOverlap,
  }
}
