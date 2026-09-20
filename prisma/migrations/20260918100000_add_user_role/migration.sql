-- CreateEnum
CREATE TYPE "career_os"."UserRole" AS ENUM ('user', 'admin');

-- AlterTable
ALTER TABLE "career_os"."users" ADD COLUMN "role" "career_os"."UserRole" NOT NULL DEFAULT 'user';
