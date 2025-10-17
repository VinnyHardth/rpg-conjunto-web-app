import { PrismaClient, itemType } from "@prisma/client";
export const seedItems = async (prisma: PrismaClient) => {
  await prisma.items.createMany({
    data: [
      { name: "Espada de Ferro", value: 100, itemType: itemType.EQUIPPABLE },
      { name: "Poção de Cura", value: 20, itemType: itemType.CONSUMABLE }
    ],
    skipDuplicates: true
  });
};
