import { PrismaClient, DamageType, StackingPolicy } from "@prisma/client";
const prisma = new PrismaClient();
export const seedEffects = async () => {
  await prisma.effect.createMany({
    data: [
      {
        name: "Regeneração",
        damageType: DamageType.NONE,
        stackingPolicy: StackingPolicy.REFRESH,
        description: "Cura por turno",
      },
      {
        name: "Veneno",
        damageType: DamageType.TRUE,
        stackingPolicy: StackingPolicy.STACK,
        description: "Dano por turno",
      },
    ],
    skipDuplicates: true,
  });
};
