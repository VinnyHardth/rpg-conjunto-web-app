import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const seedStatus = async () => {
  const chars = await prisma.character.findMany({ select: { id: true } });
  for (const ch of chars) {
    await prisma.status.createMany({
      data: [
        { characterId: ch.id, name: "HP", valueMax: 100, valueActual: 100 },
        { characterId: ch.id, name: "MP", valueMax: 50, valueActual: 50 },
        { characterId: ch.id, name: "TP", valueMax: 10, valueActual: 10 }
      ],
      skipDuplicates: true
    });
  }
};
