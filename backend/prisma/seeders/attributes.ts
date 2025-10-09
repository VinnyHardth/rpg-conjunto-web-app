import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const attributesData: Prisma.AttributesCreateInput[] = [
  {
    name: "Strength",
    kind: "ATTRIBUTE",
  },

  {
    name: "Dexterity",
    kind: "ATTRIBUTE",
  },

  {
    name: "Intelligence",
    kind: "ATTRIBUTE",
  },

  {
    name: "Constitution",
    kind: "ATTRIBUTE",
  },

  {
    name: "Wisdom",
    kind: "ATTRIBUTE",
  },

  {
    name: "Charisma",
    kind: "ATTRIBUTE",
  },

  {
    name: "Destiny",
    kind: "ATTRIBUTE",
  },
];

export const attributesSeeder = async () => {
  const attributes = await prisma.attributes.findMany();
  if (attributes.length === 0) {
    for (const attribute of attributesData) {
      await prisma.attributes.create({ data: attribute });
    }
  }
};
