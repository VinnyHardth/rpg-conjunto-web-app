import { PrismaClient } from "@prisma/client";

import { seedUser } from "./seeders/user";
import { seedArchetypes } from "./seeders/archetypes";
import { seedAttributes } from "./seeders/attributes";
import { seedExpertises } from "./seeders/expertises";
import { seedAbilities } from "./seeders/abilities";
import { seedEffects } from "./seeders/effects";
import { seedEffectModifiers } from "./seeders/effectModifiers";
import { seedItems } from "./seeders/items";
import { seedItemHasEffect } from "./seeders/itemHasEffect";
import { seedItemSkills } from "./seeders/itemSkills";
import { seedCharacter } from "./seeders/character";
import { seedCharacterAttributes } from "./seeders/characterAttribute";
import { seedCharacterHasItem } from "./seeders/characterHasItem";
import { seedAppliedEffects } from "./seeders/appliedEffects";
import { seedStatus } from "./seeders/status";
import { seedSkills } from "./seeders/skills";
import { seedAbilityEffects } from "./seeders/abilityEffect";

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();

    // Ordem lógica de inserção
    await seedUser();
    await seedArchetypes();
    await seedAttributes();
    await seedExpertises();
    await seedAbilities();
    await seedEffects();
    await seedEffectModifiers();
    await seedItems();

    // Relações entre entidades
    await seedItemHasEffect();
    await seedItemSkills();
    await seedAbilityEffects();

    // Núcleo dos personagens
    await seedCharacter();
    await seedCharacterAttributes();
    await seedCharacterHasItem();
    await seedStatus();
    await seedSkills();
    await seedAppliedEffects();

    console.log("Seed concluído com sucesso!");
  } catch (e) {
    console.error("Erro ao rodar o seed:", e);
  } finally {
    await prisma.$disconnect();
    console.log("Conexão com o banco encerrada.");
  }
}

main();
