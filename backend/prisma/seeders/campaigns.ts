import { PrismaClient } from "@prisma/client";

export const seedCampaigns = async (prisma: PrismaClient) => {
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@example.com" }
  });

  if (!adminUser) {
    console.warn("Admin user not found, skipping campaign seed.");
    return;
  }

  const campaignName = "A Jornada dos Heróis";
  const existingCampaign = await prisma.campaign.findFirst({
    where: { name: campaignName }
  });

  if (!existingCampaign) {
    await prisma.campaign.create({
      data: {
        name: campaignName,
        description: "Uma campanha de teste para iniciar as aventuras.",
        creatorId: adminUser.id,
        imageUrl:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
        isFinished: false
      }
    });
  }
};
