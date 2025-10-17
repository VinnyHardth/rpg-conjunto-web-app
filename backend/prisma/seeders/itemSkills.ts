import { PrismaClient } from "@prisma/client";
export const seedItemSkills = async (prisma: PrismaClient) => {
  const sword = await prisma.items.findFirst({
    where: { name: "Espada de Ferro" }
  });
  const ability = await prisma.abilities.findFirst({
    where: { name: "Golpe Poderoso" }
  });
  if (!sword || !ability) return;
  await prisma.itemSkills.createMany({
    data: [{ itemId: sword.id, abilityId: ability.id, cooldown: 0 }],
    skipDuplicates: true
  });
};
