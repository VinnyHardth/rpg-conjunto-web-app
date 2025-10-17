import { PrismaClient } from "@prisma/client";

export const seedCharacterPerCampaign = async (prisma: PrismaClient) => {
  const campaign = await prisma.campaign.findFirst({
    where: { name: "A Jornada dos Heróis" }
  });

  const tharion = await prisma.character.findFirst({
    where: { name: "Tharion" }
  });

  const lyra = await prisma.character.findFirst({
    where: { name: "Lyra" }
  });

  if (!campaign || !tharion || !lyra) {
    console.warn(
      "Campaign or characters not found, skipping character-campaign link seed."
    );
    return;
  }

  await prisma.characterPerCampaign.createMany({
    data: [
      { campaignId: campaign.id, characterId: tharion.id, role: "CHARACTER" },
      { campaignId: campaign.id, characterId: lyra.id, role: "CHARACTER" }
    ],
    skipDuplicates: true
  });
};
