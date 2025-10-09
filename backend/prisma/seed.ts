import { PrismaClient } from "@prisma/client";

import { abilitiesSeeder } from "./seeders/abilities";
import { attributesSeeder } from "./seeders/attributes";
import { archetypeSeeder } from "./seeders/archetypes";
import { characterSeeder } from "./seeders/character";
import { effectSeeder } from "./seeders/effects";
import { expertisesSeeder } from "./seeders/expertises";
import { itemSeeder } from "./seeders/items";
import { userSeeder } from "./seeders/user";

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    await userSeeder();
    await archetypeSeeder();
    await attributesSeeder();
    await expertisesSeeder();
    await abilitiesSeeder();
    await itemSeeder();
    await effectSeeder();
    await characterSeeder();

    console.log("Seed concluído com sucesso!");
  } catch (e) {
    console.error("Erro ao rodar o seed:", e);
  } finally {
    await prisma.$disconnect();
    console.log("Conexão com o banco encerrada.");
  }
}

main();
