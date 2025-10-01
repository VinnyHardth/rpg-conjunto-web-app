import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const effectData: Prisma.EffectCreateInput[] = [
  {
    id: "1",
    name: "Dano",
    description: "Causa dano verdadeiro",
    damageType: "TRUE",
    stackingPolicy: "NONE",
    removableBy: "NONE", 
  },
];

export const effectSeeder = async () => {
  const effects = await prisma.effect.findMany();
  if (effects.length === 0) {
    for (const data of effectData) {
      await prisma.effect.create({ data });
    }
  }
};
