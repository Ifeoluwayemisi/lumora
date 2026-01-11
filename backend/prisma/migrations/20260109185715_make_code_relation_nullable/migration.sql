-- DropForeignKey
ALTER TABLE `verificationlog` DROP FOREIGN KEY `VerificationLog_codeId_fkey`;

-- AlterTable
ALTER TABLE `verificationlog` MODIFY `codeId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `VerificationLog` ADD CONSTRAINT `VerificationLog_codeId_fkey` FOREIGN KEY (`codeId`) REFERENCES `Code`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
