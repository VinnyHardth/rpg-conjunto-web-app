import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const seedAbilityEffects = async () => {
  const ability = await prisma.abilities.findFirst({
    where: { name: "Bola de Fogo" }
  });
  const effect = await prisma.effect.findFirst({ where: { name: "Veneno" } });
  if (ability && effect) {
    await prisma.abilityEffect.createMany({
      data: [{ abilityId: ability.id, effectId: effect.id, formula: "1d4" }],
      skipDuplicates: true
    });
  }
};
