import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const expertisesData: Prisma.AttributesCreateInput[] = [
    {
        name: "Magic resistance",
        kind: "EXPERTISE"
    },

    {
        name: "Physical resistance",
        kind: "EXPERTISE"
    },

    {
        name: "Perception",
        kind: "EXPERTISE"
    },

    {
        name: "Intimidation",
        kind: "EXPERTISE"
    },

    {
        name: "Faith",
        kind: "EXPERTISE"
    },

    {
        name: "Inspiration",
        kind: "EXPERTISE"
    },

    {
        name: "Determination",
        kind: "EXPERTISE"
    },
    
    {
        name: "Bluff",
        kind: "EXPERTISE"
    },

    {
        name: "Reflexes",
        kind: "EXPERTISE"
    },
];

export const expertisesSeeder = async () => {
    const expertises = await prisma.attributes.findMany();
    if (expertises.length === 0) {
        for (const expertises of expertisesData) {
           await prisma.attributes.create({ data: expertises });
        }
    }
}