/*
  Warnings:

  - You are about to drop the column `PasswordResetToken` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `PasswordResetToken`,
    ADD COLUMN `passwordResetToken` VARCHAR(191) NULL;
