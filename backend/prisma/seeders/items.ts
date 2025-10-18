import { type PrismaClient, itemType } from "@prisma/client";

const ITEMS_DATA = [
  { name: "Espada de Ferro", value: 100, itemType: itemType.EQUIPPABLE },
  { name: "Poção de Cura", value: 20, itemType: itemType.CONSUMABLE }
];

export const seedItems = async (prisma: PrismaClient) => {
  console.log("Seeding items...");
  for (const item of ITEMS_DATA) {
    const existing = await prisma.items.findFirst({
      where: { name: item.name }
    });
    if (existing) {
      await prisma.items.update({
        where: { id: existing.id },
        data: item
      });
    } else {
      await prisma.items.create({ data: item });
    }
  }
};
