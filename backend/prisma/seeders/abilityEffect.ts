import type { PrismaClient } from "@prisma/client";
export const seedAbilityEffects = async (prisma: PrismaClient) => {
  console.log("Seeding ability effects...");
  const ability = await prisma.abilities.findFirst({
    where: { name: "Bola de Fogo" }
  });
  const effect = await prisma.effect.findFirst({ where: { name: "Veneno" } });

  if (ability && effect) {
    const data = { abilityId: ability.id, effectId: effect.id, formula: "1d4" };
    await prisma.abilityEffect.upsert({
      where: {
        abilityId_effectId: { abilityId: ability.id, effectId: effect.id }
      },
      update: { formula: data.formula },
      create: data
    });
  }
};
