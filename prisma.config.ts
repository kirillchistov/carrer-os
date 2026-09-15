import "dotenv/config"
import { defineConfig, env } from "prisma/config"

// Used by `prisma migrate` / `prisma db push` / `prisma studio` only.
// The app's runtime PrismaClient connects separately via a driver adapter
// (see src/lib/db/prisma.ts) against the pooled DATABASE_URL.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
})
