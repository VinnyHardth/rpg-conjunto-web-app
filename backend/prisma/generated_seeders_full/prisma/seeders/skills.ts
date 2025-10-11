import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const seedSkills = async () => {
  const ability1 = await prisma.abilities.findFirst({
    where: { name: "Golpe Poderoso" },
  });
  const ability2 = await prisma.abilities.findFirst({
    where: { name: "Bola de Fogo" },
  });
  const chars = await prisma.character.findMany({ select: { id: true } });
  if (!ability1 || !ability2 || chars.length === 0) return;
  for (const ch of chars) {
    await prisma.skill.createMany({
      data: [
        { characterId: ch.id, abilityId: ability1.id },
        { characterId: ch.id, abilityId: ability2.id },
      ],
      skipDuplicates: true,
    });
  }
};
