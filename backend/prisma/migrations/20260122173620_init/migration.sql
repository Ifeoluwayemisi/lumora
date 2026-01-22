-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "twoFactorSecret" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "beforeState" JSONB,
    "afterState" JSONB,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManufacturerReview" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "adminId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "riskAssessment" TEXT,
    "trustScore" DOUBLE PRECISION,
    "documentVerification" JSONB,
    "rejectionReason" TEXT,
    "requestedDocuments" TEXT[],
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManufacturerReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReport" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT,
    "reporterEmail" TEXT,
    "productName" TEXT,
    "productCode" TEXT,
    "scanType" TEXT,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "imagePath" TEXT,
    "verificationId" TEXT,
    "productId" TEXT,
    "manufacturerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "riskLevel" TEXT,
    "adminNotes" TEXT,
    "reviewedByAdminId" TEXT,
    "relatedCaseId" TEXT,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "UserReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseFile" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "productId" TEXT,
    "batchId" TEXT,
    "manufacturerId" TEXT,
    "primaryReportId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "locations" TEXT[],
    "aiAnalysis" JSONB,
    "verificationEvidence" JSONB,
    "nafdacReported" BOOLEAN NOT NULL DEFAULT false,
    "nafdacReportDate" TIMESTAMP(3),
    "nafdacStatus" TEXT,
    "nafdacReference" TEXT,
    "adminNotes" TEXT,
    "assignedAdminId" TEXT,
    "closedAt" TIMESTAMP(3),
    "closedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseNote" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AdminUser_email_idx" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AdminUser_role_idx" ON "AdminUser"("role");

-- CreateIndex
CREATE INDEX "AdminUser_isActive_idx" ON "AdminUser"("isActive");

-- CreateIndex
CREATE INDEX "AdminUser_lastLogin_idx" ON "AdminUser"("lastLogin");

-- CreateIndex
CREATE INDEX "AdminAuditLog_adminId_idx" ON "AdminAuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_timestamp_idx" ON "AdminAuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AdminAuditLog_resourceType_idx" ON "AdminAuditLog"("resourceType");

-- CreateIndex
CREATE INDEX "AdminAuditLog_action_idx" ON "AdminAuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "ManufacturerReview_manufacturerId_key" ON "ManufacturerReview"("manufacturerId");

-- CreateIndex
CREATE INDEX "ManufacturerReview_manufacturerId_idx" ON "ManufacturerReview"("manufacturerId");

-- CreateIndex
CREATE INDEX "ManufacturerReview_status_idx" ON "ManufacturerReview"("status");

-- CreateIndex
CREATE INDEX "ManufacturerReview_createdAt_idx" ON "ManufacturerReview"("createdAt");

-- CreateIndex
CREATE INDEX "UserReport_reporterId_idx" ON "UserReport"("reporterId");

-- CreateIndex
CREATE INDEX "UserReport_status_idx" ON "UserReport"("status");

-- CreateIndex
CREATE INDEX "UserReport_riskLevel_idx" ON "UserReport"("riskLevel");

-- CreateIndex
CREATE INDEX "UserReport_reportedAt_idx" ON "UserReport"("reportedAt");

-- CreateIndex
CREATE INDEX "UserReport_verificationId_idx" ON "UserReport"("verificationId");

-- CreateIndex
CREATE INDEX "UserReport_productId_idx" ON "UserReport"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseFile_caseNumber_key" ON "CaseFile"("caseNumber");

-- CreateIndex
CREATE INDEX "CaseFile_caseNumber_idx" ON "CaseFile"("caseNumber");

-- CreateIndex
CREATE INDEX "CaseFile_status_idx" ON "CaseFile"("status");

-- CreateIndex
CREATE INDEX "CaseFile_severity_idx" ON "CaseFile"("severity");

-- CreateIndex
CREATE INDEX "CaseFile_createdAt_idx" ON "CaseFile"("createdAt");

-- CreateIndex
CREATE INDEX "CaseFile_nafdacReported_idx" ON "CaseFile"("nafdacReported");

-- CreateIndex
CREATE INDEX "CaseNote_caseId_idx" ON "CaseNote"("caseId");

-- CreateIndex
CREATE INDEX "CaseNote_adminId_idx" ON "CaseNote"("adminId");

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManufacturerReview" ADD CONSTRAINT "ManufacturerReview_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReport" ADD CONSTRAINT "UserReport_reviewedByAdminId_fkey" FOREIGN KEY ("reviewedByAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReport" ADD CONSTRAINT "UserReport_relatedCaseId_fkey" FOREIGN KEY ("relatedCaseId") REFERENCES "CaseFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseFile" ADD CONSTRAINT "CaseFile_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseNote" ADD CONSTRAINT "CaseNote_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CaseFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseNote" ADD CONSTRAINT "CaseNote_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
