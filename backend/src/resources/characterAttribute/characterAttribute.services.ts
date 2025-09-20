import { PrismaClient } from '@prisma/client';
import { CreateCharacterAttributeDTO, UpdateCharacterAttributeDTO, CharacterAttributeDTO } from './characterAttribute.types';

const prisma = new PrismaClient();

export const createCharacterAttribute = async (data: CreateCharacterAttributeDTO): Promise<CharacterAttributeDTO> => {
  return prisma.characterAttribute.create({ data });
};

export const getCharacterAttributeById = async (id: string): Promise<CharacterAttributeDTO | null> => {
  return prisma.characterAttribute.findUnique({ where: { id } });
};

export const getCharacterAttributes = async (): Promise<CharacterAttributeDTO[]> => {
  return prisma.characterAttribute.findMany();
};

export const updateCharacterAttribute = async (id: string, data: UpdateCharacterAttributeDTO): Promise<CharacterAttributeDTO> => {
  return prisma.characterAttribute.update({ where: { id }, data });
};

export const deleteCharacterAttribute = async (id: string): Promise<CharacterAttributeDTO> => {
  return prisma.characterAttribute.update({ where: { id }, data: { deletedAt: new Date() } });
};
