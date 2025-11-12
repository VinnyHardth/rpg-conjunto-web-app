import { type PrismaClient, SourceType } from "@prisma/client";
export const seedAppliedEffects = async (prisma: PrismaClient) => {
  console.log("Seeding applied effects...");
  const char = await prisma.character.findFirst({ where: { name: "Tharion" } });
  const regen = await prisma.effect.findFirst({
    where: { name: "Regeneração" }
  });

  if (!char || !regen) return;

  const data = {
    characterId: char.id,
    effectId: regen.id,
    sourceType: SourceType.OTHER,
    duration: 3,
    startedAt: 0,
    expiresAt: 3,
    stacks: 1,
    value: 5
  };

  const existing = await prisma.appliedEffect.findFirst({
    where: {
      characterId: char.id,
      effectId: regen.id,
      sourceType: SourceType.OTHER
    }
  });

  if (existing) {
    await prisma.appliedEffect.update({
      where: { id: existing.id },
      data: { duration: data.duration, stacks: data.stacks }
    });
  } else {
    await prisma.appliedEffect.create({ data });
  }
};
