/*
  Warnings:

  - You are about to drop the column `equipable` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `stat` on the `ItemBonus` table. All the data in the column will be lost.
  - Added the required column `attribute` to the `ItemBonus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Inventory` DROP COLUMN `equipable`,
    ADD COLUMN `type` VARCHAR(191) NOT NULL DEFAULT 'MISC';

-- AlterTable
ALTER TABLE `ItemBonus` DROP COLUMN `stat`,
    ADD COLUMN `attribute` VARCHAR(191) NOT NULL;
