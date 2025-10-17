import { PrismaClient, CampaignMemberRole } from "@prisma/client";

export const seedCampaignMembers = async (prisma: PrismaClient) => {
  const campaign = await prisma.campaign.findFirst({
    where: { name: "A Jornada dos Heróis" }
  });

  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@example.com" }
  });

  const playerUser = await prisma.user.findUnique({
    where: { email: "player1@example.com" }
  });

  if (!campaign || !adminUser || !playerUser) {
    console.warn("Campaign or users not found, skipping campaign member seed.");
    return;
  }

  await prisma.campaignMember.createMany({
    data: [
      // Adiciona o Admin como Mestre da campanha
      {
        campaignId: campaign.id,
        userId: adminUser.id,
        role: CampaignMemberRole.MASTER,
        status: "ACTIVE"
      },
      // Adiciona o Player1 como Jogador na campanha
      {
        campaignId: campaign.id,
        userId: playerUser.id,
        role: CampaignMemberRole.PLAYER,
        status: "ACTIVE"
      }
    ],
    skipDuplicates: true
  });
};
