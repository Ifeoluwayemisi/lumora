-- AlterTable
ALTER TABLE "Manufacturer" ADD COLUMN     "accountStatus" TEXT NOT NULL DEFAULT 'pending_verification',
ADD COLUMN     "country" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "email" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'BASIC',
ADD COLUMN     "riskLevel" TEXT NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Manufacturer_email_idx" ON "Manufacturer"("email");

-- CreateIndex
CREATE INDEX "Manufacturer_accountStatus_idx" ON "Manufacturer"("accountStatus");
