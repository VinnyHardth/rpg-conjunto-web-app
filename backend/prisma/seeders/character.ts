import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const characterData: Prisma.CharacterCreateInput[] = [
  {
    id: "1",
    name: "Arvel o Bravo",
    race: "Humano",
    age: 28,
    height: 1.82,
    money: 150,
    annotations: "Um guerreiro novato que busca glória.",
    user: { connect: { id: "1" } },         // relaciona com User
    archetype: { connect: { id: "1" } },    // relaciona com Archetype
  },
];

export const characterSeeder = async () => {
  const characters = await prisma.character.findMany();
  if (characters.length === 0) {
    for (const data of characterData) {
      await prisma.character.create({ data }); // create, não createMany
    }
  }
};

