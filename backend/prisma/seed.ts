import { seedUser } from "./seeders/user";
import { seedArchetypes } from "./seeders/archetypes";
import { seedAttributes } from "./seeders/attributes";
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
import { seedCampaigns } from "./seeders/campaigns";
import { seedCharacterPerCampaign } from "./seeders/characterPerCampaign";
import { seedCampaignMembers } from "./seeders/campaignMember";
import prisma from "../src/prisma";
async function main() {
  try {
    await prisma.$connect();

    console.log("🌱 Stage 1: Seeding base data...");
    // Dados que não têm dependências entre si
    await seedUser(prisma);
    await seedArchetypes(prisma);
    await seedAttributes(prisma); // Agora inclui expertises
    await seedAbilities(prisma);
    await seedEffects(prisma);
    await seedItems(prisma);
    console.log("✅ Stage 1 complete.");

    console.log("🌱 Stage 2: Seeding relations and modifiers...");
    // Dependem da Stage 1
    await seedEffectModifiers(prisma);
    await seedAbilityEffects(prisma);
    await seedItemHasEffect(prisma);
    await seedItemSkills(prisma);
    console.log("✅ Stage 2 complete.");

    console.log("🌱 Stage 3: Seeding campaign and character data...");
    // Dependem de Users, Archetypes, etc.
    await seedCampaigns(prisma);
    await seedCharacter(prisma);
    console.log("✅ Stage 3 complete.");

    console.log("🌱 Stage 4: Seeding character-specific data...");
    // Dependem de Personagens e Campanhas existirem
    await seedCampaignMembers(prisma);
    await seedCharacterPerCampaign(prisma);

    // Estes precisam rodar em sequência para evitar race conditions.
    // 1. Atributos do personagem devem ser criados primeiro.
    await seedCharacterAttributes(prisma);
    // 2. Status (HP, MP) depende dos atributos para o cálculo.
    await seedStatus(prisma);

    // 3. O restante pode rodar em paralelo.
    await Promise.all([
      seedCharacterHasItem(prisma),
      seedSkills(prisma),
      seedAppliedEffects(prisma)
    ]);
    console.log("✅ Stage 4 complete.");

    console.log("Seed concluído com sucesso!");
  } catch (e) {
    console.error("Erro ao rodar o seed:", e);
  } finally {
    await prisma.$disconnect();
    console.log("Conexão com o banco encerrada.");
  }
}

main();
