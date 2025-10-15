import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const seedItemHasEffect = async () => {
  const sword = await prisma.items.findFirst({
    where: { name: "Espada de Ferro" }
  });
  const regen = await prisma.effect.findFirst({
    where: { name: "Regeneração" }
  });
  if (!sword || !regen) return;
  await prisma.itemHasEffect.createMany({
    data: [{ itemId: sword.id, effectsId: regen.id, formula: "+1" }],
    skipDuplicates: true
  });
};
