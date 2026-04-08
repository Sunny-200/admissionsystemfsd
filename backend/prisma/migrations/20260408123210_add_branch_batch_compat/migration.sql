-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE 'PWD_CERTIFICATE';

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "batchId" TEXT,
ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "isPwd" BOOLEAN,
ADD COLUMN     "jeeAdvancedCategoryRank" INTEGER,
ADD COLUMN     "jeeAdvancedRank" INTEGER,
ADD COLUMN     "jeeMainCategoryRank" INTEGER,
ADD COLUMN     "jeeMainRank" INTEGER,
ADD COLUMN     "pwdDisabilityType" TEXT;

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchIntake" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "intake" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchIntake_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Batch_code_key" ON "Batch"("code");

-- CreateIndex
CREATE INDEX "Batch_isActive_idx" ON "Batch"("isActive");

-- CreateIndex
CREATE INDEX "Batch_startYear_endYear_idx" ON "Batch"("startYear", "endYear");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");

-- CreateIndex
CREATE INDEX "Branch_isActive_idx" ON "Branch"("isActive");

-- CreateIndex
CREATE INDEX "Branch_name_idx" ON "Branch"("name");

-- CreateIndex
CREATE INDEX "BranchIntake_branchId_idx" ON "BranchIntake"("branchId");

-- CreateIndex
CREATE INDEX "BranchIntake_batchId_idx" ON "BranchIntake"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "BranchIntake_branchId_batchId_key" ON "BranchIntake"("branchId", "batchId");

-- CreateIndex
CREATE INDEX "StudentProfile_branchId_idx" ON "StudentProfile"("branchId");

-- CreateIndex
CREATE INDEX "StudentProfile_batchId_idx" ON "StudentProfile"("batchId");

-- AddForeignKey
ALTER TABLE "BranchIntake" ADD CONSTRAINT "BranchIntake_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchIntake" ADD CONSTRAINT "BranchIntake_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
