import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const seedArchetypes = async () => {
  const existing = await prisma.archetype.findMany({
    select: { name: true },
  });

  const existingNames = new Set(existing.map((a) => a.name));

  const data = [
    { name: "Melee", hp: 5, mp: 4, tp: 7 },
    { name: "Ranged", hp: 3, mp: 4, tp: 9 },
    { name: "Magic", hp: 3, mp: 11, tp: 2 },
    { name: "Healer", hp: 4, mp: 9, tp: 3 },
    { name: "Tank", hp: 9, mp: 2, tp: 5 },
    { name: "Tank-Healer", hp: 8, mp: 5, tp: 3 },
    { name: "Melee-Magic", hp: 4, mp: 6, tp: 6 },
    { name: "Ranged-Magic", hp: 3, mp: 5, tp: 8 },
    { name: "Magic-Healer", hp: 2, mp: 12, tp: 2 },
    { name: "Tank-Melee", hp: 7, mp: 3, tp: 6 },
    { name: "Tank-Ranged", hp: 7, mp: 2, tp: 7 },
    { name: "Tank-Magic", hp: 7, mp: 7, tp: 2 },
    { name: "None", hp: 6, mp: 5, tp: 5 },
  ].filter((a) => !existingNames.has(a.name));

  if (data.length > 0) {
    await prisma.archetype.createMany({ data });
  }
};
