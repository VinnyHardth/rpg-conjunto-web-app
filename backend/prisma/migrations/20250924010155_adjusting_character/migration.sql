-- AlterTable
ALTER TABLE `characters` ADD COLUMN `generation` INTEGER NOT NULL DEFAULT 2,
    ADD COLUMN `type` ENUM('NPC', 'PC', 'DEAD') NOT NULL DEFAULT 'PC';
