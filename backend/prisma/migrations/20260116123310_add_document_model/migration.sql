-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_review',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Document_manufacturerId_idx" ON "Document"("manufacturerId");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Document_manufacturerId_type_key" ON "Document"("manufacturerId", "type");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
