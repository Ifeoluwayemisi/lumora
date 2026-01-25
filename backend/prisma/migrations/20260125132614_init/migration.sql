-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountStatus" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "isFlagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "AdminSettings" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT false,
    "digestFrequency" TEXT NOT NULL DEFAULT 'weekly',
    "sessionTimeout" INTEGER NOT NULL DEFAULT 30,
    "twoFactorRequired" BOOLEAN NOT NULL DEFAULT true,
    "ipWhitelist" BOOLEAN NOT NULL DEFAULT false,
    "theme" TEXT NOT NULL DEFAULT 'auto',
    "alertsCritical" BOOLEAN NOT NULL DEFAULT true,
    "alertsHigh" BOOLEAN NOT NULL DEFAULT true,
    "alertsModerate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminSettings_adminId_key" ON "AdminSettings"("adminId");

-- CreateIndex
CREATE INDEX "AdminSettings_adminId_idx" ON "AdminSettings"("adminId");

-- AddForeignKey
ALTER TABLE "Manufacturer" ADD CONSTRAINT "Manufacturer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSettings" ADD CONSTRAINT "AdminSettings_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManufacturerReview" ADD CONSTRAINT "ManufacturerReview_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
