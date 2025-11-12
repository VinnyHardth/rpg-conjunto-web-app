import type { PrismaClient } from "@prisma/client";
export const seedItemHasEffect = async (prisma: PrismaClient) => {
  console.log("Seeding item effects...");
  const sword = await prisma.items.findFirst({
    where: { name: "Espada de Ferro" }
  });
  const regen = await prisma.effect.findFirst({
    where: { name: "Regeneração" }
  });

  if (!sword || !regen) return;

  const data = { itemId: sword.id, effectsId: regen.id, formula: "+1" };
  await prisma.itemHasEffect.upsert({
    where: { itemId_effectsId: { itemId: sword.id, effectsId: regen.id } },
    update: { formula: data.formula },
    create: data
  });
};
