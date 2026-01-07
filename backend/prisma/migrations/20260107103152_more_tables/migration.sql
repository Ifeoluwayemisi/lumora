/*
  Warnings:

  - The values [UNREGISTERED_RISK] on the enum `Incident_state` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `productId` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productionDate` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qrCodeImage` to the `Code` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qrImagePath` to the `Code` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codeValue` to the `VerificationLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `batch` ADD COLUMN `productId` VARCHAR(191) NOT NULL,
    ADD COLUMN `productionDate` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `code` ADD COLUMN `isUsed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `qrCodeImage` VARCHAR(191) NOT NULL,
    ADD COLUMN `qrImagePath` VARCHAR(191) NOT NULL,
    ADD COLUMN `usedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `verificationlog` ADD COLUMN `codeValue` VARCHAR(191) NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL,
    ADD COLUMN `riskScore` DOUBLE NULL,
    MODIFY `verificationState` ENUM('GENUINE', 'CODE_ALREADY_USED', 'INVALID', 'UNREGISTERED_PRODUCT', 'SUSPICIOUS_PATTERN') NOT NULL;

-- CreateTable
CREATE TABLE `Incident` (
    `id` VARCHAR(191) NOT NULL,
    `codeValue` VARCHAR(191) NOT NULL,
    `riskScore` DOUBLE NOT NULL,
    `state` ENUM('GENUINE', 'CODE_ALREADY_USED', 'INVALID', 'UNREGISTERED_PRODUCT', 'SUSPICIOUS_PATTERN') NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Incident_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `manufacturerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Batch_batchNumber_idx` ON `Batch`(`batchNumber`);

-- CreateIndex
CREATE INDEX `Batch_expirationDate_idx` ON `Batch`(`expirationDate`);

-- CreateIndex
CREATE INDEX `Code_codeValue_idx` ON `Code`(`codeValue`);

-- CreateIndex
CREATE INDEX `Code_isUsed_idx` ON `Code`(`isUsed`);

-- CreateIndex
CREATE INDEX `Drug_manufacturerId_idx` ON `Drug`(`manufacturerId`);

-- CreateIndex
CREATE INDEX `User_role_idx` ON `User`(`role`);

-- CreateIndex
CREATE INDEX `VerificationLog_codeValue_idx` ON `VerificationLog`(`codeValue`);

-- CreateIndex
CREATE INDEX `VerificationLog_verificationState_idx` ON `VerificationLog`(`verificationState`);

-- CreateIndex
CREATE INDEX `VerificationLog_createdAt_idx` ON `VerificationLog`(`createdAt`);

-- AddForeignKey
ALTER TABLE `Manufacturer` ADD CONSTRAINT `Manufacturer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Drug` ADD CONSTRAINT `Drug_manufacturerId_fkey` FOREIGN KEY (`manufacturerId`) REFERENCES `Manufacturer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Batch` ADD CONSTRAINT `Batch_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Code` ADD CONSTRAINT `Code_manufacturerId_fkey` FOREIGN KEY (`manufacturerId`) REFERENCES `Manufacturer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
