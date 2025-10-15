import { PrismaClient } from "@prisma/client";
import {
  CreateCharacterHasItemDTO,
  UpdateCharacterHasItemDTO,
  CharacterHasItemDTO
} from "./characterHasItem.types";

const prisma = new PrismaClient();

export const createCharacterHasItem = async (
  data: CreateCharacterHasItemDTO
): Promise<CharacterHasItemDTO> => {
  return prisma.characterHasItem.create({ data });
};

export const getCharacterHasItemsByCharacterId = async (
  characterId: string
): Promise<CharacterHasItemDTO[]> => {
  return prisma.characterHasItem.findMany({ where: { characterId } });
};

export const getCharacterHasItemById = async (
  id: string
): Promise<CharacterHasItemDTO | null> => {
  return prisma.characterHasItem.findUnique({ where: { id } });
};

export const getCharacterHasItems = async (): Promise<
  CharacterHasItemDTO[]
> => {
  return prisma.characterHasItem.findMany();
};

export const updateCharacterHasItem = async (
  id: string,
  data: UpdateCharacterHasItemDTO
): Promise<CharacterHasItemDTO> => {
  return prisma.characterHasItem.update({ where: { id }, data });
};

export const deleteCharacterHasItem = async (
  id: string
): Promise<CharacterHasItemDTO> => {
  return prisma.characterHasItem.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
};
