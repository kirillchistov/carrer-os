import { prisma } from "@/lib/db/prisma"

export async function getDashboardSummary(userId: string) {
  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [needingAction, followUpsDue, upcomingInterviews, applicationsByStage] = await Promise.all([
    prisma.opportunity.count({
      where: { userId, nextAction: { not: null }, nextActionDueAt: { lte: in7Days } },
    }),
    prisma.opportunity.count({
      where: { userId, followUpAt: { lte: in7Days, not: null } },
    }),
    prisma.interview.count({
      where: { userId, date: { gte: now, lte: in7Days } },
    }),
    prisma.opportunity.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
  ])

  return { needingAction, followUpsDue, upcomingInterviews, applicationsByStage }
}

export async function getOnboardingProgress(userId: string) {
  const [profile, trackCount, evidenceCount, opportunityCount] = await Promise.all([
    prisma.candidateProfile.findUnique({ where: { userId } }),
    prisma.careerTrack.count({ where: { userId } }),
    prisma.evidence.count({ where: { userId } }),
    prisma.opportunity.count({ where: { userId } }),
  ])

  return {
    hasProfile: !!profile,
    hasCareerTrack: trackCount > 0,
    hasEvidence: evidenceCount >= 3,
    hasOpportunities: opportunityCount >= 2,
  }
}
