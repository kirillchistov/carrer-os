export function resumeExportStem(input: {
  name: string
  opportunityTitle?: string | null
  companyName?: string | null
}): string {
  const role = (input.opportunityTitle ?? input.name).trim()
  const company = input.companyName?.trim()
  const looksLikeDraft = /черновик|загруженн/i.test(role)
  const safeRole = !role || looksLikeDraft ? "Резюме" : role
  const parts = company ? [safeRole, company] : [safeRole]
  return parts.join(" — ").replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120)
}
