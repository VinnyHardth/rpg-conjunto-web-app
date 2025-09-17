import { PrismaClient } from "@prisma/client";

import { CreateInventoryDTO, UpdateInventoryDTO, DeleteInventoryDTO, InventoryDTO } from "./inventory.types";

const prisma = new PrismaClient();

const inventoryFields = {
    id: true,
    name: true,
    description: true,
    quantity: true,
    type: true,
    equipped: true,
    slot: true,
    characterId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
};

// CRUD operations -------------------------------------------------------------
const createInventoryItem = async (data: CreateInventoryDTO): Promise<InventoryDTO> => {
    const newItem = await prisma.inventory.create({
        data,
        select: inventoryFields,
    });
    return newItem;
};

const getInventoryByCharacterId = async (characterId: string): Promise<InventoryDTO[]> => {
    const items = await prisma.inventory.findMany({
        where: { characterId, deletedAt: null },
        select: inventoryFields,
    });
    return items;
};

const updateInventoryItem = async (id: string, data: UpdateInventoryDTO): Promise<InventoryDTO | null> => {
    try {
        const updatedItem = await prisma.inventory.update({
            where: { id },
            data,
            select: inventoryFields,
        });
        return updatedItem;
    } catch (error) {
        // If the item does not exist or is deleted, return null
        return null;
    }
};

const deleteInventoryItem = async (id: string): Promise<InventoryDTO | null> => {
    try {
        const deletedItem = await prisma.inventory.update({
            where: { id },
            data: { deletedAt: new Date() },
            select: inventoryFields,
        });
        return deletedItem;
    } catch (error) {
        // If the item does not exist or is already deleted, return null
        return null;
    }
};

export {
    createInventoryItem,
    getInventoryByCharacterId,
    updateInventoryItem,
    deleteInventoryItem,
};

