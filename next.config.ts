import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["unpdf", "pg", "@prisma/adapter-pg"],
}

export default nextConfig
