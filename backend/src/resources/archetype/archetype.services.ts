import { PrismaClient } from "@prisma/client";
import {
  CreateArchetypeDTO,
  UpdateArchetypeDTO,
  ArchetypeDTO
} from "./archetype.types";

const prisma = new PrismaClient();

const createArchetype = async (
  data: CreateArchetypeDTO
): Promise<ArchetypeDTO> => {
  return prisma.archetype.create({ data });
};

const getArchetypeById = async (id: string): Promise<ArchetypeDTO | null> => {
  return prisma.archetype.findUnique({
    where: { id }
  });
};

const getArchetypes = async (): Promise<ArchetypeDTO[]> => {
  return prisma.archetype.findMany();
};

const updateArchetype = async (
  id: string,
  data: UpdateArchetypeDTO
): Promise<ArchetypeDTO> => {
  return prisma.archetype.update({
    where: { id },
    data
  });
};

const deleteArchetype = async (id: string): Promise<ArchetypeDTO> => {
  return prisma.archetype.delete({
    where: { id }
  });
};

export {
  createArchetype,
  getArchetypeById,
  getArchetypes,
  updateArchetype,
  deleteArchetype
};
