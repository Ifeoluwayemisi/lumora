/*
  Warnings:

  - You are about to drop the column `drugId` on the `Batch` table. All the data in the column will be lost.
  - Added the required column `productId` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productionDate` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codeValue` to the `VerificationLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_drugId_fkey";

-- DropForeignKey
ALTER TABLE "VerificationLog" DROP CONSTRAINT "VerificationLog_codeId_fkey";

-- AlterTable
ALTER TABLE "Batch" DROP COLUMN "drugId",
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "productionDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Code" ADD COLUMN     "isUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "qrImagePath" TEXT,
ADD COLUMN     "usedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserFavorites" ADD COLUMN     "productId" TEXT;

-- AlterTable
ALTER TABLE "VerificationLog" ADD COLUMN     "batchId" TEXT,
ADD COLUMN     "codeValue" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "manufacturerId" TEXT,
ADD COLUMN     "riskScore" DOUBLE PRECISION,
ALTER COLUMN "codeId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "codeValue" TEXT NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "state" "VerificationState" NOT NULL,
    "status" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Incident_status_idx" ON "Incident"("status");

-- CreateIndex
CREATE INDEX "Batch_batchNumber_idx" ON "Batch"("batchNumber");

-- CreateIndex
CREATE INDEX "Batch_expirationDate_idx" ON "Batch"("expirationDate");

-- CreateIndex
CREATE INDEX "Batch_manufacturerId_idx" ON "Batch"("manufacturerId");

-- CreateIndex
CREATE INDEX "Code_codeValue_idx" ON "Code"("codeValue");

-- CreateIndex
CREATE INDEX "Code_isUsed_idx" ON "Code"("isUsed");

-- CreateIndex
CREATE INDEX "Code_manufacturerId_idx" ON "Code"("manufacturerId");

-- CreateIndex
CREATE INDEX "Drug_manufacturerId_idx" ON "Drug"("manufacturerId");

-- CreateIndex
CREATE INDEX "Manufacturer_userId_idx" ON "Manufacturer"("userId");

-- CreateIndex
CREATE INDEX "VerificationLog_codeValue_idx" ON "VerificationLog"("codeValue");

-- CreateIndex
CREATE INDEX "VerificationLog_verificationState_idx" ON "VerificationLog"("verificationState");

-- CreateIndex
CREATE INDEX "VerificationLog_createdAt_idx" ON "VerificationLog"("createdAt");

-- CreateIndex
CREATE INDEX "VerificationLog_userId_idx" ON "VerificationLog"("userId");

-- AddForeignKey
ALTER TABLE "Drug" ADD CONSTRAINT "Drug_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Code" ADD CONSTRAINT "Code_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationLog" ADD CONSTRAINT "VerificationLog_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "Code"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationLog" ADD CONSTRAINT "VerificationLog_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationLog" ADD CONSTRAINT "VerificationLog_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
