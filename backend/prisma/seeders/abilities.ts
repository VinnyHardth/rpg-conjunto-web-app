import { PrismaClient, CostType } from "@prisma/client";
const prisma = new PrismaClient();
export const seedAbilities = async () => {
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
