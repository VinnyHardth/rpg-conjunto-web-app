import { PrismaClient } from "@prisma/client";
import {
  CreateAbilitiesDTO,
  UpdateAbilitiesDTO,
  AbilitiesDTO,
} from "./abilities.types";

const prisma = new PrismaClient();

export const createAbilities = async (
  data: CreateAbilitiesDTO,
): Promise<AbilitiesDTO> => {
  return prisma.abilities.create({ data });
};

export const getAbilitiesById = async (
  id: string,
): Promise<AbilitiesDTO | null> => {
  return prisma.abilities.findUnique({ where: { id } });
};

export const getAbilitiess = async (): Promise<AbilitiesDTO[]> => {
  return prisma.abilities.findMany();
};

export const updateAbilities = async (
  id: string,
  data: UpdateAbilitiesDTO,
): Promise<AbilitiesDTO> => {
  return prisma.abilities.update({ where: { id }, data });
};

export const deleteAbilities = async (id: string): Promise<AbilitiesDTO> => {
  return prisma.abilities.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
