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
import { seedCampaigns } from "./seeders/campaigns";
import { seedCharacterPerCampaign } from "./seeders/characterPerCampaign";
import { seedCampaignMembers } from "./seeders/campaignMember";
import prisma from "../src/prisma";
async function main() {
  try {
    await prisma.$connect();

    console.log("🌱 Stage 1: Seeding base data...");
    await Promise.all([
      seedUser(prisma),
      seedArchetypes(prisma),
      seedAttributes(prisma),
      seedExpertises(prisma),
      seedAbilities(prisma),
      seedEffects(prisma),
      seedItems(prisma)
    ]);
    console.log("✅ Stage 1 complete.");

    console.log("🌱 Stage 2: Seeding characters and relations...");
    // These depend on Stage 1. Campaigns and Characters must exist before we link them.
    await seedCampaigns(prisma);
    await seedCharacter(prisma);
    await Promise.all([
      seedItemHasEffect(prisma),
      seedItemSkills(prisma),
      seedAbilityEffects(prisma),
      seedEffectModifiers(prisma),
      seedCharacterPerCampaign(prisma), // Now runs after characters and campaigns are created
      seedCampaignMembers(prisma) // Now runs after users and campaigns are created
    ]);
    console.log("✅ Stage 2 complete.");

    console.log("🌱 Stage 3: Seeding character-specific data...");
    // These depend on characters being created in stage 2
    await Promise.all([
      seedCharacterAttributes(prisma),
      seedCharacterHasItem(prisma),
      seedStatus(prisma),
      seedSkills(prisma),
      seedAppliedEffects(prisma)
    ]);
    console.log("✅ Stage 3 complete.");

    console.log("Seed concluído com sucesso!");
  } catch (e) {
    console.error("Erro ao rodar o seed:", e);
  } finally {
    await prisma.$disconnect();
    console.log("Conexão com o banco encerrada.");
  }
}

main();
