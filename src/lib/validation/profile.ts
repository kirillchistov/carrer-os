import { z } from "zod"
import type { CandidateProfile } from "@prisma/client"
import { employmentFormatSchema, localeSchema, workModeSchema } from "./enums"

export const profileFormSchema = z.object({
  headline: z.string().max(200).nullable(),
  location: z.string().max(200).nullable(),
  phone: z.string().max(50).nullable(),
  websiteUrl: z.string().url().nullable(),
  linkedinUrl: z.string().url().nullable(),
  preferredLanguages: z.array(localeSchema),
  preferredFormats: z.array(employmentFormatSchema),
  targetLocations: z.array(z.string()),
  targetWorkModes: z.array(workModeSchema),
  compensationMin: z.number().int().nonnegative().nullable(),
  compensationMax: z.number().int().nonnegative().nullable(),
  compensationCurrency: z.string().max(10).nullable(),
  preferredIndustries: z.array(z.string()),
  preferredCompanyTypes: z.array(z.string()),
  preferredCompanySizes: z.array(z.string()),
  preferredCompanyStages: z.array(z.string()),
  openToLowerLevelIfScopeFits: z.boolean(),
  nonNegotiables: z.string().max(2000).nullable(),
  currentSituation: z.string().max(2000).nullable(),
  careerChangeReason: z.string().max(2000).nullable(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export const profileFormDefaults: ProfileFormValues = {
  headline: null,
  location: null,
  phone: null,
  websiteUrl: null,
  linkedinUrl: null,
  preferredLanguages: [],
  preferredFormats: [],
  targetLocations: [],
  targetWorkModes: [],
  compensationMin: null,
  compensationMax: null,
  compensationCurrency: null,
  preferredIndustries: [],
  preferredCompanyTypes: [],
  preferredCompanySizes: [],
  preferredCompanyStages: [],
  openToLowerLevelIfScopeFits: false,
  nonNegotiables: null,
  currentSituation: null,
  careerChangeReason: null,
}

export function toProfileFormValues(profile: CandidateProfile | null): ProfileFormValues {
  if (!profile) return profileFormDefaults
  return {
    headline: profile.headline,
    location: profile.location,
    phone: profile.phone,
    websiteUrl: profile.websiteUrl,
    linkedinUrl: profile.linkedinUrl,
    preferredLanguages: profile.preferredLanguages,
    preferredFormats: profile.preferredFormats,
    targetLocations: profile.targetLocations,
    targetWorkModes: profile.targetWorkModes,
    compensationMin: profile.compensationMin,
    compensationMax: profile.compensationMax,
    compensationCurrency: profile.compensationCurrency,
    preferredIndustries: profile.preferredIndustries,
    preferredCompanyTypes: profile.preferredCompanyTypes,
    preferredCompanySizes: profile.preferredCompanySizes,
    preferredCompanyStages: profile.preferredCompanyStages,
    openToLowerLevelIfScopeFits: profile.openToLowerLevelIfScopeFits,
    nonNegotiables: profile.nonNegotiables,
    currentSituation: profile.currentSituation,
    careerChangeReason: profile.careerChangeReason,
  }
}
