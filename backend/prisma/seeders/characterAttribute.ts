import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const seedCharacterAttributes = async () => {
  const attrs = await prisma.attributes.findMany({
    where: { name: { in: ["Força", "Destreza"] } }
  });
  const chars = await prisma.character.findMany({ select: { id: true } });
  if (attrs.length === 0 || chars.length === 0) return;
  for (const ch of chars) {
    for (const at of attrs) {
      await prisma.characterAttribute.createMany({
        data: [
          {
            characterId: ch.id,
            attributeId: at.id,
            valueBase: 5,
            valueInv: 0,
            valueExtra: 0
          }
        ],
        skipDuplicates: true
      });
    }
  }
};
