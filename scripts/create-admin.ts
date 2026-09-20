import "dotenv/config"
import { randomBytes } from "node:crypto"
import { createClient } from "@supabase/supabase-js"
import { ADMIN_EMAIL } from "@/lib/auth/impersonation"
import { prisma } from "@/lib/db/prisma"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set`)
  return value
}

async function main() {
  const admin = createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const password = randomBytes(18).toString("base64url")

  const { data: listed, error: listError } = await admin.auth.admin.listUsers({ perPage: 200 })
  if (listError) throw new Error(listError.message)
  const found = listed.users.find((u) => u.email === ADMIN_EMAIL)

  if (found) {
    await prisma.user.upsert({
      where: { id: found.id },
      update: { role: "admin", email: ADMIN_EMAIL },
      create: { id: found.id, email: ADMIN_EMAIL, locale: "ru", role: "admin" },
    })
    console.log("Admin role granted to existing user", ADMIN_EMAIL)
    console.log("Password unchanged. Reset it from /forgot-password if needed.")
    return
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password,
    email_confirm: true,
  })
  if (error || !data.user) {
    throw new Error(error?.message ?? "createUser failed")
  }

  await prisma.user.upsert({
    where: { id: data.user.id },
    update: { role: "admin", email: ADMIN_EMAIL },
    create: { id: data.user.id, email: ADMIN_EMAIL, locale: "ru", role: "admin" },
  })
  await prisma.creditAccount.upsert({
    where: { userId: data.user.id },
    update: {},
    create: { userId: data.user.id, balance: 20 },
  })

  console.log("Created", ADMIN_EMAIL)
  console.log("Temporary password:", password)
  console.log("Change it after first login.")
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
