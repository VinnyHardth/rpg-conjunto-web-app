import { PrismaClient } from "@prisma/client";
import {
  CreateEffectModifierDTO,
  UpdateEffectModifierDTO,
  EffectModifierDTO,
} from "./effectModifier.types";

const prisma = new PrismaClient();

export const createEffectModifier = async (
  data: CreateEffectModifierDTO,
): Promise<EffectModifierDTO> => {
  return prisma.effectModifier.create({ data });
};

export const getEffectModifierById = async (
  id: string,
): Promise<EffectModifierDTO | null> => {
  return prisma.effectModifier.findUnique({ where: { id } });
};

export const getEffectModifiers = async (): Promise<EffectModifierDTO[]> => {
  return prisma.effectModifier.findMany();
};

export const updateEffectModifier = async (
  id: string,
  data: UpdateEffectModifierDTO,
): Promise<EffectModifierDTO> => {
  return prisma.effectModifier.update({ where: { id }, data });
};

export const deleteEffectModifier = async (
  id: string,
): Promise<EffectModifierDTO> => {
  return prisma.effectModifier.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
