import { CreateItemsDTO, UpdateItemsDTO, ItemsDTO } from "./items.types";

import prisma from "../../prisma";
import { deleteCharacterHasItem } from "../characterHasItem/characterHasItem.services";

export const createItems = async (data: CreateItemsDTO): Promise<ItemsDTO> => {
  return prisma.items.create({ data });
};

export const getItemsById = async (id: string): Promise<ItemsDTO | null> => {
  return prisma.items.findUnique({ where: { id } });
};

export const getItemss = async (): Promise<ItemsDTO[]> => {
  return prisma.items.findMany();
};

export const updateItems = async (
  id: string,
  data: UpdateItemsDTO
): Promise<ItemsDTO> => {
  return prisma.items.update({ where: { id }, data });
};

export const deleteItems = async (id: string): Promise<ItemsDTO> => {
  const affectedInventory = await prisma.characterHasItem.findMany({
    where: { itemId: id, deletedAt: null },
    select: { id: true }
  });

  for (const entry of affectedInventory) {
    await deleteCharacterHasItem(entry.id);
  }

  return prisma.items.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
};
