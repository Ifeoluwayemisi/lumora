-- DropForeignKey
ALTER TABLE `batch` DROP FOREIGN KEY `Batch_drugId_fkey`;

-- AlterTable
ALTER TABLE `batch` MODIFY `drugId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Batch` ADD CONSTRAINT `Batch_drugId_fkey` FOREIGN KEY (`drugId`) REFERENCES `Drug`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
