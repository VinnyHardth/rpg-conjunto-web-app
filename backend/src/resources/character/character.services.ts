import { PrismaClient } from "@prisma/client";
import { CreateCharacterDTO, UpdateCharacterDTO, DeleteCharacterDTO, CharacterDTO } from "./character.types";

const prisma = new PrismaClient();

const characterFields = {
    id: true,
    name: true,
    nickname: true,
    description: true,
    imageUrl: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
};

const createCharacter = async (data: CreateCharacterDTO): Promise<CharacterDTO> => {
    return prisma.character.create({
        data,
        select: characterFields,
    });
};

const getCharacterById = async (id: string): Promise<CharacterDTO | null> => {
    return prisma.character.findUnique({
        where: {id},
        select: characterFields,
    });
}

const getUserCharacters = async (userId: string): Promise<CharacterDTO[]> => {
    return prisma.character.findMany({
        where: {userId, deletedAt: null},
        select: characterFields,
    });
}

const getCharacters = async (): Promise<CharacterDTO[]> => {
    return prisma.character.findMany({
        where: {deletedAt: null},
        select: characterFields,
    });
}

const updateCharacter = async (id: string, data: UpdateCharacterDTO): Promise<CharacterDTO> => {
    return prisma.character.update({
        where: {id},
        data,
        select: characterFields,
    });
};

const deleteCharacter = async (id: string): Promise<CharacterDTO> => {
    return prisma.character.update({
        where: {id},
        data: {deletedAt: new Date()},
        select: characterFields,
    });
}

export {
    createCharacter,
    getCharacterById,
    getUserCharacters,
    getCharacters,
    updateCharacter,
    deleteCharacter,
};