import {PrismaClient} from "@prisma/client";

import { archetypeSeeder } from "./seeders/archetypes";
import { attributesSeeder } from "./seeders/attributes";
import { expertisesSeeder } from "./seeders/expertises";

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    await archetypeSeeder();
    await attributesSeeder();
    await expertisesSeeder();
    console.log("Seed concluído com sucesso!");
  } catch (e) {
    console.error("Erro ao rodar o seed:", e);
  } finally {
    await prisma.$disconnect();
    console.log("Conexão com o banco encerrada.");
  }
}

main();
