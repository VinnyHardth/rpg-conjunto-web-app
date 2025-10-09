import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const abilitiesData: Prisma.AbilitiesCreateInput[] = [
  {
    id: "1",
    name: "Golpe Poderoso",
    description: "Um ataque físico que aplica dano extra baseado em Força.",
    cost_type: "TP",
    mp_cost: 10,
    hp_cost: 10,
    tp_cost: 10,
    cooldown_value: 2,
  },
];

export const abilitiesSeeder = async () => {
  const abilities = await prisma.abilities.findMany();
  if (abilities.length === 0) {
    for (const data of abilitiesData) {
      await prisma.abilities.create({ data }); // usar create, não createMany
    }
  }
};
