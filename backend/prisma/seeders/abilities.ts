import { type PrismaClient, CostType } from "@prisma/client";

const ABILITIES_DATA = [
  {
    name: "Golpe Poderoso",
    cost_type: CostType.TP,
    tp_cost: 5,
    cooldown_value: 1
  },
  {
    name: "Bola de Fogo",
    cost_type: CostType.MP,
    mp_cost: 10,
    cooldown_value: 2
  }
];

export const seedAbilities = async (prisma: PrismaClient) => {
  console.log("Seeding abilities...");
  for (const ability of ABILITIES_DATA) {
    const existing = await prisma.abilities.findFirst({
      where: { name: ability.name }
    });
    if (existing) {
      await prisma.abilities.update({
        where: { id: existing.id },
        data: ability
      });
    } else {
      await prisma.abilities.create({ data: ability });
    }
  }
};
