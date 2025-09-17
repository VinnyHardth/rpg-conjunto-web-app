import { PrismaClient } from "@prisma/client";

import { CreateCharacterStateDTO, UpdateCharacterStateDTO, DeleteCharacterStateDTO, CharacterStateDTO } from "./charState.types";
import { calculateMaxHP, calculateMaxMP, calculateMaxTP, calculateExpertises } from "../../utils/calculateEssentials";
import { getCharacterStats } from "../stats/stats.services";
import { StatsDTO } from "../stats/stats.types";
import { getCharacterById } from "../character/character.services";

const prisma = new PrismaClient();

const charStateFields = {
    id: true,
    characterId: true,
    maxHP: true,
    currentHP: true,
    maxMP: true,
    currentMP: true,
    maxTP: true,
    currentTP: true,
    magicRes: true,
    fisicalRes: true,
    perception: true,
    intimidation: true,
    faith: true,
    inspiration: true,
    determination: true,
    bluff: true,
    reflexes: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
};

// CRUD operations -------------------------------------------------------------
const createCharacterState = async (data: CreateCharacterStateDTO): Promise<CharacterStateDTO> => {
    // Verifica se o personagem existe
    const character = await getCharacterById(data.characterId);
    if (!character) {
        throw new Error("Character not found");
    }

    // Verifica se o personagem já tem um estado
    const existingState = await prisma.characterState.findFirst({
        where: { characterId: data.characterId, deletedAt: null },
    });
    if (existingState) {
        throw new Error("Character state already exists for this character");
    }

    // Busca os stats do personagem
    const stats: StatsDTO | null = await getCharacterStats(data.characterId);
    if (!stats) {
        throw new Error("Character stats not found. Cannot create character state without stats.");
    }
    
    // Calcula os valores iniciais
    const expertises = calculateExpertises(stats);
    const maxHP = calculateMaxHP(stats, undefined, character.archetype);
    const maxMP = calculateMaxMP(stats, undefined, character.archetype);
    const maxTP = calculateMaxTP(stats, undefined, character.archetype);
    
    return prisma.characterState.create({
        data: {
            ...data,
            ...expertises,
            maxHP,
            currentHP: maxHP,
            maxMP,
            currentMP: maxMP,
            maxTP, 
            currentTP: maxTP,
        },
        select: charStateFields,
    });
}

const getCharacterStateById = async (id: string): Promise<CharacterStateDTO | null> => {
    return prisma.characterState.findUnique({
        where: {id},
        select: charStateFields,
    });
}

const getCharacterStateByCharacterId = async (characterId: string): Promise<CharacterStateDTO | null> => {
    return prisma.characterState.findFirst({
        where: {characterId, deletedAt: null},
        select: charStateFields,
    });
}

const updateCharacterState = async (id: string, data: UpdateCharacterStateDTO): Promise<CharacterStateDTO> => {
    return prisma.characterState.update({
        where: {id},
        data,
        select: charStateFields,
    });
}

const systemUpdateCharacterState = async (characterId: string): Promise<CharacterStateDTO | null> => {
    const charState = await getCharacterStateByCharacterId(characterId);
    if (!charState) {
        return null;
    }
    
    const character = await getCharacterById(characterId);
    if (!character) {
        throw new Error("Character not found");
    }

    // Busca os stats do personagem
    const stats: StatsDTO | null = await getCharacterStats(characterId);
    if (!stats) {
        throw new Error("Character stats not found. Cannot create character state without stats.");
    }

    const expertises = calculateExpertises(stats);
    const maxHP = calculateMaxHP(stats, undefined, character.archetype);
    const maxMP = calculateMaxMP(stats, undefined, character.archetype);
    const maxTP = calculateMaxTP(stats, undefined, character.archetype);

    return prisma.characterState.update({
        where: {id: charState.id},
        data: {
            ...expertises,
            maxHP,
            currentHP: Math.min(charState.currentHP, maxHP),
            maxMP,
            currentMP: Math.min(charState.currentMP, maxMP),
            maxTP,
            currentTP: Math.min(charState.currentTP, maxTP),
        },
        select: charStateFields,
    });
}

const deleteCharacterState = async (id: string): Promise<CharacterStateDTO> => {
    return prisma.characterState.update({
        where: {id},
        data: {deletedAt: new Date()},
        select: charStateFields,
    });
}

export { createCharacterState, getCharacterStateById, getCharacterStateByCharacterId, updateCharacterState, systemUpdateCharacterState, deleteCharacterState };