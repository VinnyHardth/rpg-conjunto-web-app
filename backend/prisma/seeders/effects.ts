import { type PrismaClient, DamageType, StackingPolicy } from "@prisma/client";

const EFFECTS_DATA = [
  {
    name: "Regeneração",
    damageType: DamageType.NONE,
    stackingPolicy: StackingPolicy.REFRESH,
    description: "Cura por turno"
  },
  {
    name: "Veneno",
    damageType: DamageType.TRUE,
    stackingPolicy: StackingPolicy.STACK,
    description: "Dano por turno"
  },
  {
    name: "Dano Físico",
    damageType: DamageType.PHISICAL,
    stackingPolicy: StackingPolicy.NONE,
    description: "Dano físico direto"
  },
  {
    name: "Dano Mágico",
    damageType: DamageType.MAGIC,
    stackingPolicy: StackingPolicy.NONE,
    description: "Dano mágico direto"
  },
  {
    name: "Cura",
    damageType: DamageType.NONE,
    stackingPolicy: StackingPolicy.NONE,
    description: "Recupera pontos de vida imediatamente"
  },
  {
    name: "Restaura Mana",
    damageType: DamageType.NONE,
    stackingPolicy: StackingPolicy.NONE,
    description: "Restaura uma quantidade de mana imediatamente"
  },
  {
    name: "Reduz Mana",
    damageType: DamageType.NONE,
    stackingPolicy: StackingPolicy.NONE,
    description: "Reduz a quantidade atual de mana"
  },
  {
    name: "Restaura Técnica",
    damageType: DamageType.NONE,
    stackingPolicy: StackingPolicy.NONE,
    description: "Restaura uma quantidade de técnica imediatamente"
  },
  {
    name: "Reduz Técnica",
    damageType: DamageType.NONE,
    stackingPolicy: StackingPolicy.NONE,
    description: "Reduz a quantidade atual de técnica"
  }
];

export const seedEffects = async (prisma: PrismaClient) => {
  console.log("Seeding effects...");
  for (const effect of EFFECTS_DATA) {
    const existing = await prisma.effect.findFirst({
      where: { name: effect.name }
    });
    if (existing) {
      await prisma.effect.update({
        where: { id: existing.id },
        data: effect
      });
    } else {
      await prisma.effect.create({ data: effect });
    }
  }
};
