import type { PrismaClient } from "@prisma/client";

const CHARACTERS_DATA = [
  { name: "Tharion", gender: "M" },
  { name: "Lyra", gender: "F" }
];

export const seedCharacter = async (prisma: PrismaClient) => {
  console.log("Seeding characters...");
  const user = await prisma.user.findFirst({
    where: { email: "player1@player.com" }
  });
  const archetype = await prisma.archetype.findFirst();

  if (!user) {
    console.warn(
      "Player user 'player1@player.com' not found, skipping character seed."
    );
    return;
  }

  for (const char of CHARACTERS_DATA) {
    const data = {
      ...char,
      userId: user.id,
      archetypeId: archetype?.id || null
    };
    const existing = await prisma.character.findFirst({
      where: { name: char.name }
    });
    if (existing) {
      await prisma.character.update({
        where: { id: existing.id },
        data: { gender: data.gender, archetypeId: data.archetypeId }
      });
    } else {
      await prisma.character.create({ data });
    }
  }
};
