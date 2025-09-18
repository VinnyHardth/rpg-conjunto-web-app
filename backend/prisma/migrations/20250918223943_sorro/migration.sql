/*
  Warnings:

  - You are about to drop the column `imgUrl` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `is_consumable` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `is_equippable` on the `items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `items` DROP COLUMN `imgUrl`,
    DROP COLUMN `is_consumable`,
    DROP COLUMN `is_equippable`,
    ADD COLUMN `imageURL` VARCHAR(191) NULL,
    ADD COLUMN `itemType` ENUM('CONSUMABLE', 'EQUIPPABLE', 'MATERIAL', 'QUEST', 'MISC') NOT NULL DEFAULT 'MISC';
