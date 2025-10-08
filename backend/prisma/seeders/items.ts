import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const itemData: Prisma.ItemsCreateInput[] = [
  {
    id: "10000000-0000-0000-0000-000000000000",
    name: "Espada Longa",
    description: "Uma espada de aço comum, usada por guerreiros novatos.",
    itemType: "EQUIPPABLE",
    value: 100,
  },
];

export const itemSeeder = async () => {
  const items = await prisma.items.findMany();
  if (items.length === 0) {
    for (const data of itemData) {
      await prisma.items.create({ data });
    }
  }
};
