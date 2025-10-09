import { PrismaClient } from "@prisma/client";
import {
  CreateItemSkillsDTO,
  UpdateItemSkillsDTO,
  ItemSkillsDTO,
} from "./itemSkills.types";

const prisma = new PrismaClient();

export const createItemSkills = async (
  data: CreateItemSkillsDTO,
): Promise<ItemSkillsDTO> => {
  return prisma.itemSkills.create({ data });
};

export const getItemSkillsById = async (
  id: string,
): Promise<ItemSkillsDTO | null> => {
  return prisma.itemSkills.findUnique({ where: { id } });
};

export const getItemSkillss = async (): Promise<ItemSkillsDTO[]> => {
  return prisma.itemSkills.findMany();
};

export const updateItemSkills = async (
  id: string,
  data: UpdateItemSkillsDTO,
): Promise<ItemSkillsDTO> => {
  return prisma.itemSkills.update({ where: { id }, data });
};

export const deleteItemSkills = async (id: string): Promise<ItemSkillsDTO> => {
  return prisma.itemSkills.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
