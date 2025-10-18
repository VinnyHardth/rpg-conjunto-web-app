import { type PrismaClient, CampaignCharacterRole } from "@prisma/client";

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

  const links = [
    { characterId: tharion.id, role: CampaignCharacterRole.CHARACTER },
    { characterId: lyra.id, role: CampaignCharacterRole.CHARACTER }
  ];

  console.log("Seeding character-campaign links...");
  for (const link of links) {
    const data = { campaignId: campaign.id, ...link };
    await prisma.characterPerCampaign.upsert({
      where: {
        campaignId_characterId: {
          campaignId: campaign.id,
          characterId: link.characterId
        }
      },
      update: { role: link.role },
      create: data
    });
  }
};
