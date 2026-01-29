-- AlterTable
ALTER TABLE "Manufacturer" ADD COLUMN     "productCategory" TEXT DEFAULT 'other';

-- CreateTable
CREATE TABLE "RiskAlert" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "failureReason" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RiskAlert_manufacturerId_idx" ON "RiskAlert"("manufacturerId");

-- CreateIndex
CREATE INDEX "RiskAlert_productId_idx" ON "RiskAlert"("productId");

-- CreateIndex
CREATE INDEX "RiskAlert_riskLevel_idx" ON "RiskAlert"("riskLevel");

-- CreateIndex
CREATE INDEX "RiskAlert_status_idx" ON "RiskAlert"("status");

-- CreateIndex
CREATE INDEX "RiskAlert_createdAt_idx" ON "RiskAlert"("createdAt");

-- AddForeignKey
ALTER TABLE "RiskAlert" ADD CONSTRAINT "RiskAlert_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAlert" ADD CONSTRAINT "RiskAlert_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
