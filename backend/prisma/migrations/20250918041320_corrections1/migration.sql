/*
  Warnings:

  - You are about to drop the column `archetypeId` on the `characters` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `characters` DROP FOREIGN KEY `characters_archetypeId_fkey`;

-- DropIndex
DROP INDEX `characters_archetypeId_idx` ON `characters`;

-- AlterTable
ALTER TABLE `characters` DROP COLUMN `archetypeId`;
