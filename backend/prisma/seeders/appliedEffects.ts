import { PrismaClient, SourceType } from "@prisma/client";
export const seedAppliedEffects = async (prisma: PrismaClient) => {
  const char = await prisma.character.findFirst();
  const regen = await prisma.effect.findFirst({
    where: { name: "Regeneração" }
  });
  if (!char || !regen) return;
  await prisma.appliedEffect.createMany({
    data: [
      {
        characterId: char.id,
        effectId: regen.id,
        sourceType: SourceType.OTHER,
        duration: 3,
        startedAt: 0,
        expiresAt: 3,
        stacks: 1,
        value: 5
      }
    ],
    skipDuplicates: true
  });
};
