import { PrismaClient } from "@prisma/client";
export const seedCharacter = async (prisma: PrismaClient) => {
  const user = await prisma.user.findFirst({
    where: { email: "player1@example.com" }
  });
  // Busca o primeiro arquétipo disponível para evitar erro se "Guerreiro" não existir
  const archetype = await prisma.archetype.findFirst();
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
