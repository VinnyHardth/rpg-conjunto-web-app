import { type PrismaClient, CampaignMemberRole } from "@prisma/client";

export const seedCampaignMembers = async (prisma: PrismaClient) => {
  const campaign = await prisma.campaign.findFirst({
    where: { name: "A Jornada dos Heróis" }
  });

  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@admin.com" }
  });

  const playerUser = await prisma.user.findUnique({
    where: { email: "player1@player.com" }
  });

  if (!campaign || !adminUser || !playerUser) {
    console.warn(
      "Campaign, admin user, or player user not found, skipping campaign member seed."
    );
    return;
  }

  const members = [
    { userId: adminUser.id, role: CampaignMemberRole.MASTER, status: "ACTIVE" },
    { userId: playerUser.id, role: CampaignMemberRole.PLAYER, status: "ACTIVE" }
  ];

  console.log("Seeding campaign members...");
  for (const member of members) {
    const data = {
      campaignId: campaign.id,
      ...member
    };
    await prisma.campaignMember.upsert({
      where: {
        campaignId_userId: {
          campaignId: campaign.id,
          userId: member.userId
        }
      },
      update: { role: member.role, status: member.status },
      create: data
    });
  }
};
