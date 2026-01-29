-- DropIndex
DROP INDEX "RiskAlert_riskLevel_idx";

-- DropIndex
DROP INDEX "RiskAlert_status_idx";

-- CreateTable
CREATE TABLE "RegulatoryWebhook" (
    "id" TEXT NOT NULL,
    "agency" TEXT NOT NULL,
    "webhookUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "secret" TEXT NOT NULL,
    "retryAttempts" INTEGER NOT NULL DEFAULT 3,
    "retryIntervalSeconds" INTEGER NOT NULL DEFAULT 300,
    "timeoutSeconds" INTEGER NOT NULL DEFAULT 30,
    "headers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSuccessfulWebhook" TIMESTAMP(3),
    "lastFailedWebhook" TIMESTAMP(3),
    "failureReason" TEXT,

    CONSTRAINT "RegulatoryWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookLog" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "statusCode" INTEGER,
    "responseBody" TEXT,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "nextRetryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyRateLimit" (
    "id" TEXT NOT NULL,
    "agency" TEXT NOT NULL,
    "alertsPerHour" INTEGER NOT NULL DEFAULT 100,
    "alertsPerDay" INTEGER NOT NULL DEFAULT 1000,
    "currentHourlyCount" INTEGER NOT NULL DEFAULT 0,
    "currentDailyCount" INTEGER NOT NULL DEFAULT 0,
    "hourlyResetAt" TIMESTAMP(3) NOT NULL,
    "dailyResetAt" TIMESTAMP(3) NOT NULL,
    "isThrottled" BOOLEAN NOT NULL DEFAULT false,
    "throttleUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyRateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyFlagAnalytics" (
    "id" TEXT NOT NULL,
    "agency" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalFlaggedCodes" INTEGER NOT NULL DEFAULT 0,
    "criticalSeverity" INTEGER NOT NULL DEFAULT 0,
    "highSeverity" INTEGER NOT NULL DEFAULT 0,
    "mediumSeverity" INTEGER NOT NULL DEFAULT 0,
    "lowSeverity" INTEGER NOT NULL DEFAULT 0,
    "uniqueManufacturers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyFlagAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryDistributionSnapshot" (
    "id" TEXT NOT NULL,
    "snapshotDate" DATE NOT NULL,
    "drugs" INTEGER NOT NULL DEFAULT 0,
    "food" INTEGER NOT NULL DEFAULT 0,
    "cosmetics" INTEGER NOT NULL DEFAULT 0,
    "other" INTEGER NOT NULL DEFAULT 0,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryDistributionSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegulatoryWebhook_webhookUrl_key" ON "RegulatoryWebhook"("webhookUrl");

-- CreateIndex
CREATE INDEX "RegulatoryWebhook_isActive_idx" ON "RegulatoryWebhook"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "RegulatoryWebhook_agency_key" ON "RegulatoryWebhook"("agency");

-- CreateIndex
CREATE INDEX "WebhookLog_webhookId_idx" ON "WebhookLog"("webhookId");

-- CreateIndex
CREATE INDEX "WebhookLog_createdAt_idx" ON "WebhookLog"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookLog_success_idx" ON "WebhookLog"("success");

-- CreateIndex
CREATE UNIQUE INDEX "AgencyRateLimit_agency_key" ON "AgencyRateLimit"("agency");

-- CreateIndex
CREATE INDEX "AgencyRateLimit_agency_idx" ON "AgencyRateLimit"("agency");

-- CreateIndex
CREATE INDEX "AgencyFlagAnalytics_agency_idx" ON "AgencyFlagAnalytics"("agency");

-- CreateIndex
CREATE INDEX "AgencyFlagAnalytics_date_idx" ON "AgencyFlagAnalytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "AgencyFlagAnalytics_agency_date_key" ON "AgencyFlagAnalytics"("agency", "date");

-- CreateIndex
CREATE INDEX "CategoryDistributionSnapshot_snapshotDate_idx" ON "CategoryDistributionSnapshot"("snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryDistributionSnapshot_snapshotDate_key" ON "CategoryDistributionSnapshot"("snapshotDate");

-- AddForeignKey
ALTER TABLE "WebhookLog" ADD CONSTRAINT "WebhookLog_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "RegulatoryWebhook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
