/*
  Warnings:

  - You are about to alter the column `kind` on the `attributes` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `attributes` MODIFY `kind` ENUM('ATTRIBUTE', 'EXPERTISE') NOT NULL DEFAULT 'ATTRIBUTE';
