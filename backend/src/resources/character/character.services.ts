import { PrismaClient } from "@prisma/client";
import {
  FullCharacterData,
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


const getFullCharacterData = async (id: string): Promise<FullCharacterData> => {
  // 1️⃣ Buscar personagem base
  const character = await prisma.character.findUnique({
    where: { id },
  });

  if (!character) {
    throw new Error("Character not found");
  }

  // 2️⃣ Rodar todas as queries em paralelo
  const [attributes, status, inventory, skills, archetype] = await Promise.all([
    prisma.characterAttribute.findMany({
      where: { characterId: id },
    }),
    prisma.status.findMany({
      where: { characterId: id },
    }),
    prisma.characterHasItem.findMany({
      where: { characterId: id },
    }),
    prisma.skill.findMany({
      where: { characterId: id },
    }),
    prisma.archetype.findUnique({
      where: { id: character.archetypeId ?? "" },
    }),
  ]);

  // 3️⃣ Retornar o resultado formatado
  return {
    info: character,
    attributes,
    status,
    inventory,
    skills,
    archetype,
  };
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
  getFullCharacterData,
  getCharacterById,
  getUserCharacters,
  getCharacters,
  updateCharacter,
  deleteCharacter,
};
