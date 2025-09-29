-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `nickname` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `archetypes` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `tp` DOUBLE NOT NULL,
    `hp` DOUBLE NOT NULL,
    `mp` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `characters` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `race` VARCHAR(191) NULL,
    `age` INTEGER NULL,
    `height` DOUBLE NULL,
    `money` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `annotations` LONGTEXT NULL,
    `generation` INTEGER NOT NULL DEFAULT 2,
    `type` ENUM('NPC', 'PC', 'DEAD', 'RETIRE') NOT NULL DEFAULT 'PC',
    `imageUrl` VARCHAR(191) NULL,
    `userId` CHAR(36) NOT NULL,
    `archetypeId` CHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `characters_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attributes` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `kind` ENUM('ATTRIBUTE', 'EXPERTISE') NOT NULL DEFAULT 'ATTRIBUTE',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `character_attributes` (
    `id` CHAR(36) NOT NULL,
    `characterId` CHAR(36) NOT NULL,
    `attributeId` CHAR(36) NOT NULL,
    `valueBase` INTEGER NOT NULL DEFAULT 0,
    `valueInv` INTEGER NOT NULL DEFAULT 0,
    `valueExtra` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `character_attributes_characterId_idx`(`characterId`),
    UNIQUE INDEX `character_attributes_characterId_attributeId_key`(`characterId`, `attributeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status` (
    `id` CHAR(36) NOT NULL,
    `characterId` CHAR(36) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `valueMax` DOUBLE NOT NULL DEFAULT 0,
    `valueBonus` DOUBLE NOT NULL DEFAULT 0,
    `valueActual` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `status_characterId_idx`(`characterId`),
    UNIQUE INDEX `status_characterId_name_key`(`characterId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `effects` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `imgUrl` VARCHAR(191) NULL,
    `description` VARCHAR(400) NULL,
    `removableBy` VARCHAR(191) NULL,
    `damageType` ENUM('TRUE', 'PHISICAL', 'MAGIC', 'NONE') NOT NULL,
    `stackingPolicy` ENUM('REFRESH', 'REPLACE', 'STACK', 'NONE') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `effect_target` (
    `id` CHAR(36) NOT NULL,
    `effectId` CHAR(36) NOT NULL,
    `componentName` VARCHAR(191) NOT NULL,
    `componentType` ENUM('STATUS', 'ATTRIBUTE', 'SLOT', 'TAG', 'NONE') NOT NULL,
    `operationType` ENUM('ADD', 'MULT', 'SET', 'TOGGLE', 'OVERRIDE', 'DICE') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `effect_target_effectId_idx`(`effectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applied_effects` (
    `id` CHAR(36) NOT NULL,
    `characterId` CHAR(36) NOT NULL,
    `effectId` CHAR(36) NOT NULL,
    `sourceType` ENUM('ITEM', 'SKILL', 'OTHER') NOT NULL,
    `duration` INTEGER NOT NULL DEFAULT 0,
    `startedAt` INTEGER NOT NULL DEFAULT 0,
    `expiresAt` INTEGER NOT NULL DEFAULT 0,
    `stacks` INTEGER NOT NULL DEFAULT 0,
    `value` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `applied_effects_characterId_idx`(`characterId`),
    INDEX `applied_effects_effectId_idx`(`effectId`),
    INDEX `applied_effects_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Abilities` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `imageURL` VARCHAR(191) NULL,
    `cost_type` ENUM('MP', 'TP', 'HP', 'COMBINATION', 'NONE') NOT NULL DEFAULT 'NONE',
    `mp_cost` INTEGER NOT NULL DEFAULT 0,
    `tp_cost` INTEGER NOT NULL DEFAULT 0,
    `hp_cost` INTEGER NOT NULL DEFAULT 0,
    `cooldown_value` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ability_effects` (
    `id` CHAR(36) NOT NULL,
    `abilityId` CHAR(36) NOT NULL,
    `effectId` CHAR(36) NOT NULL,
    `formula` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `ability_effects_abilityId_effectId_key`(`abilityId`, `effectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skills` (
    `id` CHAR(36) NOT NULL,
    `characterId` CHAR(36) NOT NULL,
    `abilityId` CHAR(36) NOT NULL,
    `cooldown` INTEGER NOT NULL DEFAULT 0,
    `useType` ENUM('PASSIVE', 'ACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `skills_characterId_abilityId_key`(`characterId`, `abilityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `imageURL` VARCHAR(191) NULL,
    `value` INTEGER NOT NULL DEFAULT 0,
    `itemType` ENUM('CONSUMABLE', 'EQUIPPABLE', 'MATERIAL', 'QUEST', 'MISC') NOT NULL DEFAULT 'MISC',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `character_has_item` (
    `id` CHAR(36) NOT NULL,
    `characterId` CHAR(36) NOT NULL,
    `itemId` CHAR(36) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `value` INTEGER NULL,
    `is_equipped` BOOLEAN NOT NULL DEFAULT false,
    `equipped_slot` ENUM('HEAD', 'CHEST', 'LEGS', 'HAND', 'OFFHAND', 'RING1', 'RING2', 'NONE') NOT NULL DEFAULT 'NONE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `character_has_item_characterId_idx`(`characterId`),
    INDEX `character_has_item_itemId_idx`(`itemId`),
    UNIQUE INDEX `character_has_item_characterId_itemId_equipped_slot_key`(`characterId`, `itemId`, `equipped_slot`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_has_effects` (
    `id` CHAR(36) NOT NULL,
    `itemId` CHAR(36) NOT NULL,
    `effectsId` CHAR(36) NOT NULL,
    `formula` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `item_has_effects_itemId_effectsId_key`(`itemId`, `effectsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_skills` (
    `id` CHAR(36) NOT NULL,
    `abilityId` CHAR(36) NOT NULL,
    `itemId` CHAR(36) NOT NULL,
    `cooldown` INTEGER NOT NULL DEFAULT 0,
    `formula` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `item_skills_itemId_abilityId_key`(`itemId`, `abilityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `characters` ADD CONSTRAINT `characters_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `characters` ADD CONSTRAINT `characters_archetypeId_fkey` FOREIGN KEY (`archetypeId`) REFERENCES `archetypes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `character_attributes` ADD CONSTRAINT `character_attributes_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `characters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `character_attributes` ADD CONSTRAINT `character_attributes_attributeId_fkey` FOREIGN KEY (`attributeId`) REFERENCES `attributes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `status` ADD CONSTRAINT `status_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `characters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `effect_target` ADD CONSTRAINT `effect_target_effectId_fkey` FOREIGN KEY (`effectId`) REFERENCES `effects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applied_effects` ADD CONSTRAINT `applied_effects_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `characters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applied_effects` ADD CONSTRAINT `applied_effects_effectId_fkey` FOREIGN KEY (`effectId`) REFERENCES `effects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ability_effects` ADD CONSTRAINT `ability_effects_abilityId_fkey` FOREIGN KEY (`abilityId`) REFERENCES `Abilities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ability_effects` ADD CONSTRAINT `ability_effects_effectId_fkey` FOREIGN KEY (`effectId`) REFERENCES `effects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skills` ADD CONSTRAINT `skills_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `characters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skills` ADD CONSTRAINT `skills_abilityId_fkey` FOREIGN KEY (`abilityId`) REFERENCES `Abilities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `character_has_item` ADD CONSTRAINT `character_has_item_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `characters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `character_has_item` ADD CONSTRAINT `character_has_item_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_has_effects` ADD CONSTRAINT `item_has_effects_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_has_effects` ADD CONSTRAINT `item_has_effects_effectsId_fkey` FOREIGN KEY (`effectsId`) REFERENCES `effects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_skills` ADD CONSTRAINT `item_skills_abilityId_fkey` FOREIGN KEY (`abilityId`) REFERENCES `Abilities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_skills` ADD CONSTRAINT `item_skills_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
