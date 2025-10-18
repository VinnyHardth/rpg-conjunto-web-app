import type { PrismaClient } from "@prisma/client";
export const seedItemSkills = async (prisma: PrismaClient) => {
  console.log("Seeding item skills...");
  const sword = await prisma.items.findFirst({
    where: { name: "Espada de Ferro" }
  });
  const ability = await prisma.abilities.findFirst({
    where: { name: "Golpe Poderoso" }
  });

  if (!sword || !ability) return;

  const data = { itemId: sword.id, abilityId: ability.id, cooldown: 0 };
  await prisma.itemSkills.upsert({
    where: { itemId_abilityId: { itemId: sword.id, abilityId: ability.id } },
    update: { cooldown: data.cooldown },
    create: data
  });
};
