import { PrismaClient, CostType } from "@prisma/client";
export const seedAbilities = async (prisma: PrismaClient) => {
  await prisma.abilities.createMany({
    data: [
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
    ],
    skipDuplicates: true
  });
};
