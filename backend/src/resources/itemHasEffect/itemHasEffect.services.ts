import { PrismaClient } from '@prisma/client';
import { CreateItemHasEffectDTO, UpdateItemHasEffectDTO, ItemHasEffectDTO } from './itemHasEffect.types';

const prisma = new PrismaClient();

export const createItemHasEffect = async (data: CreateItemHasEffectDTO): Promise<ItemHasEffectDTO> => {
  return prisma.itemHasEffect.create({ data });
};

export const getItemHasEffectById = async (id: string): Promise<ItemHasEffectDTO | null> => {
  return prisma.itemHasEffect.findUnique({ where: { id } });
};

export const getItemHasEffects = async (): Promise<ItemHasEffectDTO[]> => {
  return prisma.itemHasEffect.findMany();
};

export const updateItemHasEffect = async (id: string, data: UpdateItemHasEffectDTO): Promise<ItemHasEffectDTO> => {
  return prisma.itemHasEffect.update({ where: { id }, data });
};

export const deleteItemHasEffect = async (id: string): Promise<ItemHasEffectDTO> => {
  return prisma.itemHasEffect.update({ where: { id }, data: { deletedAt: new Date() } });
};
