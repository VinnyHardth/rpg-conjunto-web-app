import { PrismaClient } from '@prisma/client';
import { CreateEffectTargetDTO, UpdateEffectTargetDTO, EffectTargetDTO } from './effectTarget.types';

const prisma = new PrismaClient();

export const createEffectTarget = async (data: CreateEffectTargetDTO): Promise<EffectTargetDTO> => {
  return prisma.effectTarget.create({ data });
};

export const getEffectTargetById = async (id: string): Promise<EffectTargetDTO | null> => {
  return prisma.effectTarget.findUnique({ where: { id } });
};

export const getEffectTargets = async (): Promise<EffectTargetDTO[]> => {
  return prisma.effectTarget.findMany();
};

export const updateEffectTarget = async (id: string, data: UpdateEffectTargetDTO): Promise<EffectTargetDTO> => {
  return prisma.effectTarget.update({ where: { id }, data });
};

export const deleteEffectTarget = async (id: string): Promise<EffectTargetDTO> => {
  return prisma.effectTarget.update({ where: { id }, data: { deletedAt: new Date() } });
};
