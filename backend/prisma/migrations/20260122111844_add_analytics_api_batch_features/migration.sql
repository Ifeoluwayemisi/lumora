-- AlterTable
ALTER TABLE "Manufacturer" ADD COLUMN     "businessCertificatePath" TEXT,
ADD COLUMN     "businessCertificateVerified" BOOLEAN DEFAULT false,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "lastActivityAt" TIMESTAMP(3),
ADD COLUMN     "lastRiskAssessment" TIMESTAMP(3),
ADD COLUMN     "lastTrustAssessment" TIMESTAMP(3),
ADD COLUMN     "nafdacLicensePath" TEXT,
ADD COLUMN     "nafdacLicenseVerified" BOOLEAN DEFAULT false,
ADD COLUMN     "photoIdPath" TEXT,
ADD COLUMN     "riskScore" INTEGER DEFAULT 50,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "websiteVerified" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "WebsiteLegitimacyCheck" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "verdict" TEXT NOT NULL,
    "registrationAgeInDays" INTEGER,
    "hasSsl" BOOLEAN,
    "isFlagged" BOOLEAN,
    "companyNameFound" BOOLEAN,
    "checkDetails" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebsiteLegitimacyCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentForgerCheck" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "verdict" TEXT NOT NULL,
    "elaResult" TEXT,
    "metadataResult" TEXT,
    "qualityScore" INTEGER,
    "hasSecurityFeatures" BOOLEAN,
    "checkDetails" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentForgerCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustScoreHistory" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrustScoreHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "rateLimit" INTEGER NOT NULL DEFAULT 1000,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchRecall" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recalledUnits" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "BatchRecall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsReport" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "metrics" JSONB NOT NULL,
    "authenticity" INTEGER,
    "geoDistribution" JSONB,
    "expiredBatches" INTEGER,
    "suspiciousActivity" INTEGER,
    "exportFormat" TEXT NOT NULL DEFAULT 'pdf',
    "exportPath" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportSchedule" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "recipients" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "dayOfWeek" INTEGER,
    "dayOfMonth" INTEGER,
    "hour" INTEGER NOT NULL DEFAULT 9,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsAudit" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebsiteLegitimacyCheck_manufacturerId_idx" ON "WebsiteLegitimacyCheck"("manufacturerId");

-- CreateIndex
CREATE INDEX "WebsiteLegitimacyCheck_checkedAt_idx" ON "WebsiteLegitimacyCheck"("checkedAt");

-- CreateIndex
CREATE INDEX "DocumentForgerCheck_manufacturerId_idx" ON "DocumentForgerCheck"("manufacturerId");

-- CreateIndex
CREATE INDEX "DocumentForgerCheck_documentType_idx" ON "DocumentForgerCheck"("documentType");

-- CreateIndex
CREATE INDEX "DocumentForgerCheck_checkedAt_idx" ON "DocumentForgerCheck"("checkedAt");

-- CreateIndex
CREATE INDEX "TrustScoreHistory_manufacturerId_idx" ON "TrustScoreHistory"("manufacturerId");

-- CreateIndex
CREATE INDEX "TrustScoreHistory_recordedAt_idx" ON "TrustScoreHistory"("recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_manufacturerId_idx" ON "ApiKey"("manufacturerId");

-- CreateIndex
CREATE INDEX "ApiKey_isActive_idx" ON "ApiKey"("isActive");

-- CreateIndex
CREATE INDEX "ApiKey_createdAt_idx" ON "ApiKey"("createdAt");

-- CreateIndex
CREATE INDEX "BatchRecall_manufacturerId_idx" ON "BatchRecall"("manufacturerId");

-- CreateIndex
CREATE INDEX "BatchRecall_status_idx" ON "BatchRecall"("status");

-- CreateIndex
CREATE INDEX "BatchRecall_initiatedAt_idx" ON "BatchRecall"("initiatedAt");

-- CreateIndex
CREATE INDEX "AnalyticsReport_manufacturerId_idx" ON "AnalyticsReport"("manufacturerId");

-- CreateIndex
CREATE INDEX "AnalyticsReport_generatedAt_idx" ON "AnalyticsReport"("generatedAt");

-- CreateIndex
CREATE INDEX "ReportSchedule_manufacturerId_idx" ON "ReportSchedule"("manufacturerId");

-- CreateIndex
CREATE INDEX "ReportSchedule_isActive_idx" ON "ReportSchedule"("isActive");

-- CreateIndex
CREATE INDEX "AnalyticsAudit_manufacturerId_idx" ON "AnalyticsAudit"("manufacturerId");

-- CreateIndex
CREATE INDEX "AnalyticsAudit_timestamp_idx" ON "AnalyticsAudit"("timestamp");

-- AddForeignKey
ALTER TABLE "WebsiteLegitimacyCheck" ADD CONSTRAINT "WebsiteLegitimacyCheck_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentForgerCheck" ADD CONSTRAINT "DocumentForgerCheck_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustScoreHistory" ADD CONSTRAINT "TrustScoreHistory_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchRecall" ADD CONSTRAINT "BatchRecall_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsReport" ADD CONSTRAINT "AnalyticsReport_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportSchedule" ADD CONSTRAINT "ReportSchedule_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsAudit" ADD CONSTRAINT "AnalyticsAudit_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
