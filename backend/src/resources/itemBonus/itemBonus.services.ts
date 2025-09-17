import { PrismaClient } from "@prisma/client";

import { CreateItemBonusDTO, UpdateItemBonusDTO, DeleteItemBonusDTO, ItemBonusDTO } from "./itemBonus.types";

const prisma = new PrismaClient();

const itemBonusFields = {
    id: true,
    itemId: true,
    attribute: true,
    type: true,
    value: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
};

// CRUD operations -------------------------------------------------------------

const createItemBonus = async (data: CreateItemBonusDTO): Promise<ItemBonusDTO> => {
    const itemBonus = await prisma.itemBonus.create({
        data,
        select: itemBonusFields,
    });
    return itemBonus;
};

const getItemBonus = async (id: string): Promise<ItemBonusDTO | null> => {
    const itemBonus = await prisma.itemBonus.findUnique({
        where: { id },
        select: itemBonusFields,
    });
    return itemBonus;
};

const getItemBonusByItemId = async (itemId: string): Promise<ItemBonusDTO[]> => {
    const itemBonuses = await prisma.itemBonus.findMany({
        where: { itemId },
        select: itemBonusFields,
    });
    return itemBonuses;
};

const updateItemBonus = async (id: string, data: UpdateItemBonusDTO): Promise<ItemBonusDTO | null> => {
    const itemBonus = await prisma.itemBonus.update({
        where: { id },
        data,
        select: itemBonusFields,
    });
    return itemBonus;
};

const deleteItemBonus = async (id: string): Promise<ItemBonusDTO | null> => {
    const itemBonus = await prisma.itemBonus.delete({
        where: { id },
        select: itemBonusFields,
    });
    return itemBonus;
};


export {
    createItemBonus,
    getItemBonus,
    getItemBonusByItemId,
    updateItemBonus,
    deleteItemBonus,
};