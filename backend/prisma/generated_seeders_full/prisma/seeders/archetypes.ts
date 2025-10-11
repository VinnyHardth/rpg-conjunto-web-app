import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const seedArchetypes = async () => {
  await prisma.archetype.createMany({
    data: [
      { name: "Guerreiro", tp: 10, hp: 100, mp: 20 },
      { name: "Mago", tp: 5, hp: 60, mp: 100 },
    ],
    skipDuplicates: true,
  });
};
