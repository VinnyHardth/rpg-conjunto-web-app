import { PrismaClient } from "@prisma/client";
import { createStatsDTO, updateStatsDTO, deleteStatsDTO, StatsDTO } from "./stats.types";

const prisma = new PrismaClient();

const statsFields = {
    id: true,
    strength: true,
    dexterity: true,
    constitution: true,
    intelligence: true,
    wisdom: true,
    charisma: true,
    destiny: true,
    characterId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
};

const createStats = async (data: createStatsDTO): Promise<StatsDTO> => {
    return prisma.stats.create({
        data,
        select: statsFields,
    });
}

const getStatsById = async (id: string): Promise<StatsDTO | null> => {
    return prisma.stats.findUnique({
        where: {id},
        select: statsFields,
    });
}

const getCharacterStats = async (characterId: string): Promise<StatsDTO | null> => {
    return prisma.stats.findFirst({
        where: {characterId, deletedAt: null},
        select: statsFields,
    });
}

const updateStats = async (id: string, data: updateStatsDTO): Promise<StatsDTO> => {
    return prisma.stats.update({
        where: {id},
        data,
        select: statsFields,
    });
}

const deleteStats = async (id: string): Promise<StatsDTO> => {
    return prisma.stats.update({
        where: {id},
        data: {deletedAt: new Date()},
        select: statsFields,
    });
}

export { createStats, getStatsById, getCharacterStats, updateStats, deleteStats };