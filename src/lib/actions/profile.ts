"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requireCurrentUser } from "@/lib/auth/session"
import { profileFormSchema, type ProfileFormValues } from "@/lib/validation/profile"

export async function getMyProfile() {
  const user = await requireCurrentUser()
  return prisma.candidateProfile.findUnique({ where: { userId: user.id } })
}

export async function saveMyProfile(values: ProfileFormValues) {
  const user = await requireCurrentUser()
  const data = profileFormSchema.parse(values)

  await prisma.candidateProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
  })

  revalidatePath("/profile")
  revalidatePath("/dashboard")
  return { ok: true as const }
}
