import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const seedCharacter = async () => {
  const user = await prisma.user.findFirst({
    where: { email: "player1@example.com" }
  });
  const archetype = await prisma.archetype.findFirst({
    where: { name: "Guerreiro" }
  });
  if (!user) return;
  await prisma.character.createMany({
    data: [
      {
        name: "Tharion",
        gender: "M",
        userId: user.id,
        archetypeId: archetype?.id || null
      },
      {
        name: "Lyra",
        gender: "F",
        userId: user.id,
        archetypeId: archetype?.id || null
      }
    ],
    skipDuplicates: true
  });
};
