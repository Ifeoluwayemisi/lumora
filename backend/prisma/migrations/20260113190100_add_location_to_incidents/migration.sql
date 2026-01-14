-- AlterTable
ALTER TABLE `incident` ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL;

-- AlterTable
ALTER TABLE `userfavorites` ADD COLUMN `productName` VARCHAR(191) NULL;
