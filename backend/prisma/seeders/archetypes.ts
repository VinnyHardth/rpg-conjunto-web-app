import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const archetypeData: Prisma.ArchetypeCreateInput[] = [
    {
        name: "Melee",
        hp: 4,
        mp: 4,
        tp: 7
    },

    {
        name: "Ranged",
        hp: 2,
        mp: 4,
        tp: 9
    },

    {
        name: "Magic",
        hp: 2,
        mp: 11,
        tp: 2
    },

    {
        name: "Healer",
        hp: 3,
        mp: 9,
        tp: 3
    },

    {
        name: "Tank",
        hp: 8,
        mp: 2,
        tp: 5
    },

    {
        name: "Tank-Healer",
        hp: 7,
        mp: 5,
        tp: 3
    },

    {
        name: "Melee-Magic",
        hp: 3,
        mp: 6,
        tp: 6
    },

    {
        name: "Ranged-Magic",
        hp: 2,
        mp: 5,
        tp: 8
    },

    {
        name: "Magic-Healer",
        hp: 1,
        mp: 12,
        tp: 2
    },

    {
        name: "Tank-Melee",
        hp: 6,
        mp: 3,
        tp: 6
    },

    {
        name: "Tank-Ranged",
        hp: 6,
        mp: 2,
        tp: 7
    },

    {
        name: "Tank-Magic",
        hp: 6,
        mp: 7,
        tp: 2
    },

    {
        name: "None",
        hp: 5,
        mp: 5,
        tp: 5
    }
];

export const archetypeSeeder = async () => {
    const archetypes = await prisma.archetype.findMany();
    if (archetypes.length === 0) {
        await prisma.archetype.createMany({ data: archetypeData });
    }
}