import { PrismaClient } from "@prisma/client";
import { CreateEffectDTO, UpdateEffectDTO, EffectDTO } from "./effect.types";

const prisma = new PrismaClient();

export const createEffect = async (
  data: CreateEffectDTO,
): Promise<EffectDTO> => {
  return prisma.effect.create({ data });
};

export const getEffectById = async (id: string): Promise<EffectDTO | null> => {
  return prisma.effect.findUnique({ where: { id } });
};

export const getEffects = async (): Promise<EffectDTO[]> => {
  return prisma.effect.findMany();
};

export const updateEffect = async (
  id: string,
  data: UpdateEffectDTO,
): Promise<EffectDTO> => {
  return prisma.effect.update({ where: { id }, data });
};

export const deleteEffect = async (id: string): Promise<EffectDTO> => {
  return prisma.effect.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
