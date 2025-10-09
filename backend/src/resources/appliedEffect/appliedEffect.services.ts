import { PrismaClient } from "@prisma/client";
import {
  CreateAppliedEffectDTO,
  UpdateAppliedEffectDTO,
  AppliedEffectDTO,
} from "./appliedEffect.types";

const prisma = new PrismaClient();

export const createAppliedEffect = async (
  data: CreateAppliedEffectDTO,
): Promise<AppliedEffectDTO> => {
  return prisma.appliedEffect.create({ data });
};

export const getAppliedEffectById = async (
  id: string,
): Promise<AppliedEffectDTO | null> => {
  return prisma.appliedEffect.findUnique({ where: { id } });
};

export const getAppliedEffects = async (): Promise<AppliedEffectDTO[]> => {
  return prisma.appliedEffect.findMany();
};

export const updateAppliedEffect = async (
  id: string,
  data: UpdateAppliedEffectDTO,
): Promise<AppliedEffectDTO> => {
  return prisma.appliedEffect.update({ where: { id }, data });
};

export const deleteAppliedEffect = async (
  id: string,
): Promise<AppliedEffectDTO> => {
  return prisma.appliedEffect.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
