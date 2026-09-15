-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "career_os";

-- CreateEnum
CREATE TYPE "career_os"."Locale" AS ENUM ('ru', 'en', 'es');

-- CreateEnum
CREATE TYPE "career_os"."EmploymentFormat" AS ENUM ('permanent', 'contract', 'project', 'fractional', 'advisory');

-- CreateEnum
CREATE TYPE "career_os"."WorkMode" AS ENUM ('onsite', 'hybrid', 'remote');

-- CreateEnum
CREATE TYPE "career_os"."VerificationStatus" AS ENUM ('unverified', 'verified', 'rejected', 'edited');

-- CreateEnum
CREATE TYPE "career_os"."ConfidenceLevel" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "career_os"."EvidenceSourceType" AS ENUM ('resume_import', 'manual_entry', 'interview_note', 'ai_suggested');

-- CreateEnum
CREATE TYPE "career_os"."OpportunityType" AS ENUM ('vacancy', 'project', 'fractional', 'advisory', 'proactive_lead');

-- CreateEnum
CREATE TYPE "career_os"."OpportunitySource" AS ENUM ('url', 'pasted_text', 'manual');

-- CreateEnum
CREATE TYPE "career_os"."OpportunityStatus" AS ENUM ('saved', 'researching', 'ready_to_apply', 'applied', 'recruiter_screen', 'hiring_manager', 'case_test_task', 'final_interview', 'offer', 'rejected', 'withdrawn', 'paused');

-- CreateEnum
CREATE TYPE "career_os"."RequirementCategory" AS ENUM ('responsibility', 'skill', 'tool', 'qualification', 'industry_experience', 'logistics', 'other');

-- CreateEnum
CREATE TYPE "career_os"."RequirementImportance" AS ENUM ('must_have', 'nice_to_have', 'inferred_context');

-- CreateEnum
CREATE TYPE "career_os"."ResumeChangeType" AS ENUM ('add', 'remove', 'rewrite', 'reorder');

-- CreateEnum
CREATE TYPE "career_os"."ResumeChangeStatus" AS ENUM ('proposed', 'accepted', 'rejected', 'edited');

-- CreateEnum
CREATE TYPE "career_os"."ResumeVersionStatus" AS ENUM ('draft', 'final', 'archived');

-- CreateEnum
CREATE TYPE "career_os"."FitDimensionStatus" AS ENUM ('strong', 'partial', 'gap', 'unknown');

-- CreateEnum
CREATE TYPE "career_os"."FitOverallLabel" AS ENUM ('strong_fit', 'partial_fit', 'weak_fit', 'unknown');

-- CreateEnum
CREATE TYPE "career_os"."FitDimension" AS ENUM ('role_fit', 'industry_fit', 'business_problem_fit', 'leadership_scale_fit', 'skills_tools_fit', 'employment_format_fit', 'logistics_fit', 'evidence_strength_fit', 'motivation_risk_fit', 'freshness_fit');

-- CreateEnum
CREATE TYPE "career_os"."ApplicationChannel" AS ENUM ('direct_apply', 'referral', 'recruiter_outreach', 'inbound', 'other');

-- CreateEnum
CREATE TYPE "career_os"."RelationshipType" AS ENUM ('recruiter', 'hiring_manager', 'referral', 'former_colleague', 'consultant', 'other');

-- CreateEnum
CREATE TYPE "career_os"."InterviewType" AS ENUM ('recruiter_screen', 'hiring_manager', 'panel', 'case_test_task', 'final_round', 'reference_check', 'other');

-- CreateEnum
CREATE TYPE "career_os"."TaskStatus" AS ENUM ('open', 'in_progress', 'done', 'cancelled');

-- CreateEnum
CREATE TYPE "career_os"."TaskPriority" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "career_os"."DocumentType" AS ENUM ('resume_import', 'cover_letter', 'other');

-- CreateEnum
CREATE TYPE "career_os"."ExtractionStatus" AS ENUM ('pending', 'success', 'partial', 'failed');

-- CreateEnum
CREATE TYPE "career_os"."AiRunType" AS ENUM ('experience_extraction', 'opportunity_parse', 'evidence_quality_suggestion', 'positioning_draft', 'fit_assessment', 'resume_proposal', 'outreach_draft', 'interview_learning');

-- CreateEnum
CREATE TYPE "career_os"."AiRunStatus" AS ENUM ('pending', 'success', 'failed');

-- CreateEnum
CREATE TYPE "career_os"."CreditTransactionReason" AS ENUM ('ai_run_debit', 'signup_bonus', 'manual_grant', 'refund');

-- CreateEnum
CREATE TYPE "career_os"."AiFeedbackTargetType" AS ENUM ('ai_run', 'experience', 'evidence', 'opportunity_requirement', 'resume_change_proposal', 'fit_assessment_dimension', 'interview_learning');

-- CreateEnum
CREATE TYPE "career_os"."AiFeedbackStatus" AS ENUM ('open', 'reviewed', 'dismissed');

-- CreateTable
CREATE TABLE "career_os"."users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "locale" "career_os"."Locale" NOT NULL DEFAULT 'ru',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."candidate_profiles" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "headline" TEXT,
    "location" TEXT,
    "phone" TEXT,
    "websiteUrl" TEXT,
    "linkedinUrl" TEXT,
    "preferredLanguages" "career_os"."Locale"[],
    "preferredFormats" "career_os"."EmploymentFormat"[],
    "targetLocations" TEXT[],
    "targetWorkModes" "career_os"."WorkMode"[],
    "compensationMin" INTEGER,
    "compensationMax" INTEGER,
    "compensationCurrency" TEXT,
    "preferredIndustries" TEXT[],
    "preferredCompanyTypes" TEXT[],
    "preferredCompanySizes" TEXT[],
    "preferredCompanyStages" TEXT[],
    "openToLowerLevelIfScopeFits" BOOLEAN NOT NULL DEFAULT false,
    "nonNegotiables" TEXT,
    "currentSituation" TEXT,
    "careerChangeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."career_tracks" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "alternativeTitles" TEXT[],
    "employmentFormats" "career_os"."EmploymentFormat"[],
    "targetIndustries" TEXT[],
    "targetCompanyTypes" TEXT[],
    "targetCompanyStages" TEXT[],
    "targetCompanySizes" TEXT[],
    "businessProblems" TEXT[],
    "mustHaveSkills" TEXT[],
    "deemphasizedExperience" TEXT,
    "valueProposition" TEXT,
    "motivationStatement" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."experiences" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyIndustry" TEXT,
    "title" TEXT NOT NULL,
    "employmentType" "career_os"."EmploymentFormat",
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "description" TEXT,
    "responsibilities" TEXT[],
    "teamSize" INTEGER,
    "budgetDescription" TEXT,
    "pAndLDescription" TEXT,
    "geographies" TEXT[],
    "clientTypes" TEXT[],
    "sourceDocumentId" TEXT,
    "verificationStatus" "career_os"."VerificationStatus" NOT NULL DEFAULT 'unverified',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."evidence" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "careerTrackId" TEXT,
    "experienceId" TEXT,
    "title" TEXT NOT NULL,
    "situation" TEXT,
    "task" TEXT,
    "action" TEXT,
    "result" TEXT,
    "metricValue" DOUBLE PRECISION,
    "metricUnit" TEXT,
    "metricDescription" TEXT,
    "timeframe" TEXT,
    "scaleDescription" TEXT,
    "teamSize" INTEGER,
    "budgetDescription" TEXT,
    "pAndLDescription" TEXT,
    "industries" TEXT[],
    "skills" TEXT[],
    "sourceType" "career_os"."EvidenceSourceType" NOT NULL DEFAULT 'manual_entry',
    "sourceReference" TEXT,
    "verificationStatus" "career_os"."VerificationStatus" NOT NULL DEFAULT 'unverified',
    "confidenceLevel" "career_os"."ConfidenceLevel" NOT NULL DEFAULT 'medium',
    "qualityScore" INTEGER,
    "qualityExplanation" TEXT,
    "isReusableInResume" BOOLEAN NOT NULL DEFAULT true,
    "isReusableInInterview" BOOLEAN NOT NULL DEFAULT true,
    "isReusableInOutreach" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."skills" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "proficiency" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "evidenceOfUse" TEXT,
    "verificationStatus" "career_os"."VerificationStatus" NOT NULL DEFAULT 'unverified',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."resumes" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "careerTrackId" TEXT,
    "name" TEXT NOT NULL,
    "language" "career_os"."Locale" NOT NULL,
    "isBase" BOOLEAN NOT NULL DEFAULT true,
    "structuredContent" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."resume_versions" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "resumeId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "name" TEXT NOT NULL,
    "language" "career_os"."Locale" NOT NULL,
    "structuredContent" JSONB NOT NULL,
    "status" "career_os"."ResumeVersionStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."resume_change_proposals" (
    "id" TEXT NOT NULL,
    "resumeVersionId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "originalText" TEXT,
    "proposedText" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "evidenceIds" JSONB NOT NULL,
    "relatedRequirementIds" JSONB NOT NULL,
    "changeType" "career_os"."ResumeChangeType" NOT NULL,
    "status" "career_os"."ResumeChangeStatus" NOT NULL DEFAULT 'proposed',
    "finalText" TEXT,
    "aiRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_change_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."opportunities" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "type" "career_os"."OpportunityType" NOT NULL,
    "companyName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceName" "career_os"."OpportunitySource" NOT NULL DEFAULT 'manual',
    "sourceUrl" TEXT,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT,
    "workMode" "career_os"."WorkMode",
    "employmentFormat" "career_os"."EmploymentFormat",
    "compensationMin" INTEGER,
    "compensationMax" INTEGER,
    "compensationCurrency" TEXT,
    "rawDescription" TEXT,
    "structuredDescription" JSONB,
    "status" "career_os"."OpportunityStatus" NOT NULL DEFAULT 'saved',
    "priority" "career_os"."TaskPriority" NOT NULL DEFAULT 'medium',
    "nextAction" TEXT,
    "nextActionDueAt" TIMESTAMP(3),
    "followUpAt" TIMESTAMP(3),
    "deadlineAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."opportunity_requirements" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "category" "career_os"."RequirementCategory" NOT NULL,
    "text" TEXT NOT NULL,
    "importance" "career_os"."RequirementImportance" NOT NULL,
    "normalizedSkill" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunity_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."fit_assessments" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "careerTrackId" TEXT NOT NULL,
    "resumeVersionId" TEXT,
    "overallLabel" "career_os"."FitOverallLabel" NOT NULL,
    "overallScore" INTEGER,
    "dimensionResults" JSONB NOT NULL,
    "gaps" JSONB NOT NULL,
    "questions" JSONB NOT NULL,
    "recommendedActions" JSONB NOT NULL,
    "aiRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fit_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."applications" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "resumeVersionId" TEXT,
    "contactId" TEXT,
    "appliedAt" TIMESTAMP(3),
    "channel" "career_os"."ApplicationChannel" NOT NULL DEFAULT 'direct_apply',
    "messageDraft" TEXT,
    "messageFinal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."contacts" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "title" TEXT,
    "email" TEXT,
    "linkedinUrl" TEXT,
    "relationshipType" "career_os"."RelationshipType" NOT NULL DEFAULT 'other',
    "notes" TEXT,
    "lastContactAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."interviews" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "stage" "career_os"."InterviewType" NOT NULL,
    "interviewerName" TEXT,
    "interviewerTitle" TEXT,
    "questions" JSONB,
    "notes" TEXT,
    "feedback" TEXT,
    "interestSignals" TEXT,
    "objections" TEXT,
    "agreements" TEXT,
    "nextStep" TEXT,
    "nextStepAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."tasks" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "opportunityId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueAt" TIMESTAMP(3),
    "status" "career_os"."TaskStatus" NOT NULL DEFAULT 'open',
    "priority" "career_os"."TaskPriority" NOT NULL DEFAULT 'medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."documents" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "storagePath" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "documentType" "career_os"."DocumentType" NOT NULL,
    "extractionStatus" "career_os"."ExtractionStatus" NOT NULL DEFAULT 'pending',
    "extractedText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."ai_runs" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "type" "career_os"."AiRunType" NOT NULL,
    "inputEntityIds" JSONB NOT NULL,
    "inputHash" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "status" "career_os"."AiRunStatus" NOT NULL DEFAULT 'pending',
    "output" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ai_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."ai_feedback_reports" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "aiRunId" TEXT,
    "targetType" "career_os"."AiFeedbackTargetType" NOT NULL,
    "targetId" TEXT,
    "comment" TEXT,
    "status" "career_os"."AiFeedbackStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_feedback_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."credit_accounts" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_os"."credit_transactions" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" "career_os"."CreditTransactionReason" NOT NULL,
    "aiRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "career_os"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_profiles_userId_key" ON "career_os"."candidate_profiles"("userId");

-- CreateIndex
CREATE INDEX "career_tracks_userId_idx" ON "career_os"."career_tracks"("userId");

-- CreateIndex
CREATE INDEX "experiences_userId_idx" ON "career_os"."experiences"("userId");

-- CreateIndex
CREATE INDEX "evidence_userId_idx" ON "career_os"."evidence"("userId");

-- CreateIndex
CREATE INDEX "evidence_careerTrackId_idx" ON "career_os"."evidence"("careerTrackId");

-- CreateIndex
CREATE INDEX "skills_userId_idx" ON "career_os"."skills"("userId");

-- CreateIndex
CREATE INDEX "resumes_userId_idx" ON "career_os"."resumes"("userId");

-- CreateIndex
CREATE INDEX "resume_versions_userId_idx" ON "career_os"."resume_versions"("userId");

-- CreateIndex
CREATE INDEX "resume_versions_resumeId_idx" ON "career_os"."resume_versions"("resumeId");

-- CreateIndex
CREATE INDEX "resume_versions_opportunityId_idx" ON "career_os"."resume_versions"("opportunityId");

-- CreateIndex
CREATE INDEX "resume_change_proposals_resumeVersionId_idx" ON "career_os"."resume_change_proposals"("resumeVersionId");

-- CreateIndex
CREATE INDEX "opportunities_userId_idx" ON "career_os"."opportunities"("userId");

-- CreateIndex
CREATE INDEX "opportunities_status_idx" ON "career_os"."opportunities"("status");

-- CreateIndex
CREATE INDEX "opportunity_requirements_opportunityId_idx" ON "career_os"."opportunity_requirements"("opportunityId");

-- CreateIndex
CREATE INDEX "fit_assessments_userId_idx" ON "career_os"."fit_assessments"("userId");

-- CreateIndex
CREATE INDEX "fit_assessments_opportunityId_idx" ON "career_os"."fit_assessments"("opportunityId");

-- CreateIndex
CREATE INDEX "applications_userId_idx" ON "career_os"."applications"("userId");

-- CreateIndex
CREATE INDEX "applications_opportunityId_idx" ON "career_os"."applications"("opportunityId");

-- CreateIndex
CREATE INDEX "contacts_userId_idx" ON "career_os"."contacts"("userId");

-- CreateIndex
CREATE INDEX "interviews_userId_idx" ON "career_os"."interviews"("userId");

-- CreateIndex
CREATE INDEX "interviews_opportunityId_idx" ON "career_os"."interviews"("opportunityId");

-- CreateIndex
CREATE INDEX "tasks_userId_idx" ON "career_os"."tasks"("userId");

-- CreateIndex
CREATE INDEX "tasks_opportunityId_idx" ON "career_os"."tasks"("opportunityId");

-- CreateIndex
CREATE INDEX "documents_userId_idx" ON "career_os"."documents"("userId");

-- CreateIndex
CREATE INDEX "ai_runs_userId_idx" ON "career_os"."ai_runs"("userId");

-- CreateIndex
CREATE INDEX "ai_runs_type_idx" ON "career_os"."ai_runs"("type");

-- CreateIndex
CREATE INDEX "ai_feedback_reports_userId_idx" ON "career_os"."ai_feedback_reports"("userId");

-- CreateIndex
CREATE INDEX "ai_feedback_reports_aiRunId_idx" ON "career_os"."ai_feedback_reports"("aiRunId");

-- CreateIndex
CREATE UNIQUE INDEX "credit_accounts_userId_key" ON "career_os"."credit_accounts"("userId");

-- CreateIndex
CREATE INDEX "credit_transactions_userId_idx" ON "career_os"."credit_transactions"("userId");

-- AddForeignKey
ALTER TABLE "career_os"."candidate_profiles" ADD CONSTRAINT "candidate_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "career_os"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."career_tracks" ADD CONSTRAINT "career_tracks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "career_os"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."experiences" ADD CONSTRAINT "experiences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "career_os"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."experiences" ADD CONSTRAINT "experiences_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "career_os"."documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."evidence" ADD CONSTRAINT "evidence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "career_os"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."evidence" ADD CONSTRAINT "evidence_careerTrackId_fkey" FOREIGN KEY ("careerTrackId") REFERENCES "career_os"."career_tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."evidence" ADD CONSTRAINT "evidence_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "career_os"."experiences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."skills" ADD CONSTRAINT "skills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "career_os"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."resumes" ADD CONSTRAINT "resumes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "career_os"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."resumes" ADD CONSTRAINT "resumes_careerTrackId_fkey" FOREIGN KEY ("careerTrackId") REFERENCES "career_os"."career_tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."resume_versions" ADD CONSTRAINT "resume_versions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "career_os"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."resume_versions" ADD CONSTRAINT "resume_versions_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "career_os"."resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."resume_versions" ADD CONSTRAINT "resume_versions_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "career_os"."opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."resume_change_proposals" ADD CONSTRAINT "resume_change_proposals_resumeVersionId_fkey" FOREIGN KEY ("resumeVersionId") REFERENCES "career_os"."resume_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."resume_change_proposals" ADD CONSTRAINT "resume_change_proposals_aiRunId_fkey" FOREIGN KEY ("aiRunId") REFERENCES "career_os"."ai_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."opportunities" ADD CONSTRAINT "opportunities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "career_os"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."opportunity_requirements" ADD CONSTRAINT "opportunity_requirements_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "career_os"."opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."fit_assessments" ADD CONSTRAINT "fit_assessments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "career_os"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."fit_assessments" ADD CONSTRAINT "fit_assessments_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "career_os"."opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."fit_assessments" ADD CONSTRAINT "fit_assessments_careerTrackId_fkey" FOREIGN KEY ("careerTrackId") REFERENCES "career_os"."career_tracks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."fit_assessments" ADD CONSTRAINT "fit_assessments_resumeVersionId_fkey" FOREIGN KEY ("resumeVersionId") REFERENCES "career_os"."resume_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."fit_assessments" ADD CONSTRAINT "fit_assessments_aiRunId_fkey" FOREIGN KEY ("aiRunId") REFERENCES "career_os"."ai_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "career_os"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."applications" ADD CONSTRAINT "applications_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "career_os"."opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."applications" ADD CONSTRAINT "applications_resumeVersionId_fkey" FOREIGN KEY ("resumeVersionId") REFERENCES "career_os"."resume_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."applications" ADD CONSTRAINT "applications_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "career_os"."contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."contacts" ADD CONSTRAINT "contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "career_os"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."interviews" ADD CONSTRAINT "interviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "career_os"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."interviews" ADD CONSTRAINT "interviews_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "career_os"."opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."tasks" ADD CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "career_os"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."tasks" ADD CONSTRAINT "tasks_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "career_os"."opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "career_os"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."ai_runs" ADD CONSTRAINT "ai_runs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "career_os"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."ai_feedback_reports" ADD CONSTRAINT "ai_feedback_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "career_os"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."ai_feedback_reports" ADD CONSTRAINT "ai_feedback_reports_aiRunId_fkey" FOREIGN KEY ("aiRunId") REFERENCES "career_os"."ai_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."credit_accounts" ADD CONSTRAINT "credit_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "career_os"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."credit_transactions" ADD CONSTRAINT "credit_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "career_os"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_os"."credit_transactions" ADD CONSTRAINT "credit_transactions_aiRunId_fkey" FOREIGN KEY ("aiRunId") REFERENCES "career_os"."ai_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

