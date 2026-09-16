-- CreateEnum
CREATE TYPE "career_os"."ResumeVersionSource" AS ENUM ('tailored', 'quick_tailor');

-- AlterTable
ALTER TABLE "career_os"."resume_versions" ADD COLUMN "source" "career_os"."ResumeVersionSource" NOT NULL DEFAULT 'tailored';
