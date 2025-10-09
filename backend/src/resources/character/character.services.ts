import { PrismaClient } from "@prisma/client";
import {
  CreateCharacterDTO,
  UpdateCharacterDTO,
  CharacterDTO,
} from "./character.types";

const prisma = new PrismaClient();

// CRUD operations -------------------------------------------------------------
const createCharacter = async (
  data: CreateCharacterDTO,
): Promise<CharacterDTO> => {
  return prisma.character.create({
    data,
  });
};

const getCharacterById = async (id: string): Promise<CharacterDTO | null> => {
  return prisma.character.findUnique({
    where: { id },
  });
};

const getUserCharacters = async (userId: string): Promise<CharacterDTO[]> => {
  return prisma.character.findMany({
    where: { userId, deletedAt: null },
  });
};

const getCharacters = async (): Promise<CharacterDTO[]> => {
  return prisma.character.findMany({
    where: { deletedAt: null },
  });
};

const updateCharacter = async (
  id: string,
  data: UpdateCharacterDTO,
): Promise<CharacterDTO> => {
  return prisma.character.update({
    where: { id },
    data,
  });
};

const deleteCharacter = async (id: string): Promise<CharacterDTO> => {
  return prisma.character.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

// character actions -------------------------------------------------------------

export {
  createCharacter,
  getCharacterById,
  getUserCharacters,
  getCharacters,
  updateCharacter,
  deleteCharacter,
};
