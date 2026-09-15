import "dotenv/config"
import { defineConfig } from "prisma/config"

// Used by `prisma migrate` / `prisma db push` / `prisma studio` only.
// The app's runtime PrismaClient connects separately via a driver adapter
// (see src/lib/db/prisma.ts) against the pooled DATABASE_URL.
//
// Read directly from process.env (not the stricter `env()` helper, which throws when
// unset) so `prisma generate` — which loads this file on every invocation, including
// the build-time `postinstall` hook, but never actually connects — keeps working in
// environments (like a fresh Vercel build) that haven't set DIRECT_URL yet.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://unset",
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
})
