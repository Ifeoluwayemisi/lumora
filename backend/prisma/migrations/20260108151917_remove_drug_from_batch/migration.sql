/*
  Warnings:

  - You are about to drop the column `drugId` on the `batch` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `batch` DROP FOREIGN KEY `Batch_drugId_fkey`;

-- AlterTable
ALTER TABLE `batch` DROP COLUMN `drugId`;
