/*
  Warnings:

  - You are about to drop the column `bonus` on the `Inventory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Inventory` DROP COLUMN `bonus`,
    ADD COLUMN `equipable` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `equipped` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `slot` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ItemBonus` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `stat` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ItemBonus` ADD CONSTRAINT `ItemBonus_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Inventory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
