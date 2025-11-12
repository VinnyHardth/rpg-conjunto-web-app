import type { PrismaClient } from "@prisma/client";
export const seedSkills = async (prisma: PrismaClient) => {
  console.log("Seeding character skills...");
  const ability1 = await prisma.abilities.findFirst({
    where: { name: "Golpe Poderoso" }
  });
  const ability2 = await prisma.abilities.findFirst({
    where: { name: "Bola de Fogo" }
  });
  const abilities = [ability1, ability2].filter(Boolean);
  const chars = await prisma.character.findMany({ select: { id: true } });

  if (abilities.length === 0 || chars.length === 0) return;

  for (const ch of chars) {
    for (const ability of abilities) {
      if (!ability) continue;
      const data = { characterId: ch.id, abilityId: ability.id };
      await prisma.skill.upsert({
        where: {
          characterId_abilityId: { characterId: ch.id, abilityId: ability.id }
        },
        update: {},
        create: data
      });
    }
  }
};
