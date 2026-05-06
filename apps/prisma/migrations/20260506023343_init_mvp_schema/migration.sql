-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'HR', 'VIEWER');

-- CreateEnum
CREATE TYPE "CompanyProfile" AS ENUM ('STARTUP', 'CONSOLIDATED', 'RESTRUCTURING', 'OTHER');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('REGISTERED', 'TEST_SENT', 'TEST_IN_PROGRESS', 'TEST_COMPLETED', 'ANALYZING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TestSessionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('DISC', 'ENNEAGRAM', 'SIXTEEN_PERSONALITIES');

-- CreateTable
CREATE TABLE "Company" (
    "id" UUID NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "companyProfile" "CompanyProfile",
    "companyContext" TEXT,
    "cultureValues" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mainChallenges" TEXT,
    "leadershipStyle" TEXT,
    "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "avatarUrl" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collaborator" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL,
    "department" TEXT,
    "parentId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Collaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "salaryMin" DECIMAL(12,2),
    "salaryMax" DECIMAL(12,2),
    "location" TEXT,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "responsibleId" UUID,
    "aiGeneratedJd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "jobId" UUID,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "resumeUrl" TEXT,
    "status" "CandidateStatus" NOT NULL DEFAULT 'REGISTERED',
    "lgpdConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSession" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "candidateId" UUID,
    "token" TEXT NOT NULL,
    "status" "TestSessionStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "currentTest" "TestType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestResponse" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "testType" "TestType" NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PsychProfile" (
    "id" UUID NOT NULL,
    "candidateId" UUID,
    "collaboratorId" UUID,
    "discD" INTEGER,
    "discI" INTEGER,
    "discS" INTEGER,
    "discC" INTEGER,
    "discDominant" TEXT,
    "discSecondary" TEXT,
    "enneagramType" INTEGER,
    "enneagramWing" TEXT,
    "enneagramLevel" INTEGER,
    "mbtiType" TEXT,
    "bigFiveO" INTEGER,
    "bigFiveC" INTEGER,
    "bigFiveE" INTEGER,
    "bigFiveA" INTEGER,
    "bigFiveN" INTEGER,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PsychProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "jobMatchScore" INTEGER NOT NULL,
    "leaderMatchScore" INTEGER NOT NULL,
    "cultureMatchScore" INTEGER NOT NULL,
    "recommendation" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "fullAnalysis" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_cnpj_key" ON "Company"("cnpj");

-- CreateIndex
CREATE INDEX "Company_deletedAt_idx" ON "Company"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_companyId_isActive_deletedAt_idx" ON "User"("companyId", "isActive", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_revokedAt_idx" ON "RefreshToken"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Collaborator_companyId_parentId_deletedAt_idx" ON "Collaborator"("companyId", "parentId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Collaborator_companyId_email_key" ON "Collaborator"("companyId", "email");

-- CreateIndex
CREATE INDEX "Job_companyId_status_deletedAt_idx" ON "Job"("companyId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "Candidate_companyId_jobId_status_deletedAt_idx" ON "Candidate"("companyId", "jobId", "status", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_companyId_email_key" ON "Candidate"("companyId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "TestSession_token_key" ON "TestSession"("token");

-- CreateIndex
CREATE INDEX "TestSession_companyId_status_expiresAt_idx" ON "TestSession"("companyId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "TestSession_candidateId_idx" ON "TestSession"("candidateId");

-- CreateIndex
CREATE INDEX "TestResponse_sessionId_testType_answeredAt_idx" ON "TestResponse"("sessionId", "testType", "answeredAt");

-- CreateIndex
CREATE UNIQUE INDEX "TestResponse_sessionId_testType_questionId_key" ON "TestResponse"("sessionId", "testType", "questionId");

-- CreateIndex
CREATE INDEX "PsychProfile_candidateId_completedAt_idx" ON "PsychProfile"("candidateId", "completedAt");

-- CreateIndex
CREATE INDEX "PsychProfile_collaboratorId_completedAt_idx" ON "PsychProfile"("collaboratorId", "completedAt");

-- CreateIndex
CREATE INDEX "Match_companyId_candidateId_createdAt_idx" ON "Match"("companyId", "candidateId", "createdAt");

-- CreateIndex
CREATE INDEX "Match_jobId_idx" ON "Match"("jobId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Collaborator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "Collaborator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestResponse" ADD CONSTRAINT "TestResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsychProfile" ADD CONSTRAINT "PsychProfile_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsychProfile" ADD CONSTRAINT "PsychProfile_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "Collaborator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
