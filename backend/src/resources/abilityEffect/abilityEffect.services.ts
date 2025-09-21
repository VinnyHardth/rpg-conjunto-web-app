import { PrismaClient } from '@prisma/client';
import { CreateAbilityEffectDTO, UpdateAbilityEffectDTO, AbilityEffectDTO } from './abilityEffect.types';

const prisma = new PrismaClient();

export const createAbilityEffect = async (data: CreateAbilityEffectDTO): Promise<AbilityEffectDTO> => {
  return prisma.abilityEffect.create({ data });
};

export const getAbilityEffectById = async (id: string): Promise<AbilityEffectDTO | null> => {
  return prisma.abilityEffect.findUnique({ where: { id } });
};

export const getAbilityEffects = async (): Promise<AbilityEffectDTO[]> => {
  return prisma.abilityEffect.findMany();
};

export const updateAbilityEffect = async (id: string, data: UpdateAbilityEffectDTO): Promise<AbilityEffectDTO> => {
  return prisma.abilityEffect.update({ where: { id }, data });
};

export const deleteAbilityEffect = async (id: string): Promise<AbilityEffectDTO> => {
  return prisma.abilityEffect.update({ where: { id }, data: { deletedAt: new Date() } });
};
