import type { PrismaClient } from "@prisma/client";

const ARCHETYPES_DATA = [
  { name: "Melee", hp: 5, mp: 4, tp: 7 },
  { name: "Ranged", hp: 3, mp: 4, tp: 9 },
  { name: "Magic", hp: 3, mp: 11, tp: 2 },
  { name: "Support", hp: 4, mp: 9, tp: 3 },
  { name: "Tank", hp: 9, mp: 2, tp: 5 },
  { name: "Tank-Support", hp: 8, mp: 5, tp: 3 },
  { name: "Melee-Magic", hp: 4, mp: 6, tp: 6 },
  { name: "Melee-Ranged", hp: 3, mp: 2, tp: 11 },
  { name: "Ranged-Magic", hp: 3, mp: 5, tp: 8 },
  { name: "Magic-Support", hp: 2, mp: 12, tp: 2 },
  { name: "Tank-Melee", hp: 7, mp: 3, tp: 6 },
  { name: "Tank-Ranged", hp: 7, mp: 2, tp: 7 },
  { name: "Tank-Magic", hp: 7, mp: 7, tp: 2 },
  { name: "None", hp: 6, mp: 5, tp: 5 }
];

export const seedArchetypes = async (prisma: PrismaClient) => {
  console.log("Seeding archetypes...");
  for (const archetype of ARCHETYPES_DATA) {
    const existing = await prisma.archetype.findFirst({
      where: { name: archetype.name }
    });
    if (existing) {
      await prisma.archetype.update({
        where: { id: existing.id },
        data: archetype
      });
    } else {
      await prisma.archetype.create({ data: archetype });
    }
  }
};
