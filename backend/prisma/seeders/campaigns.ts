import type { PrismaClient } from "@prisma/client";

export const seedCampaigns = async (prisma: PrismaClient) => {
  console.log("Seeding campaigns...");
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@admin.com" }
  });

  if (!adminUser) {
    console.warn(
      "Admin user 'admin@admin.com' not found, skipping campaign seed."
    );
    return;
  }

  const campaignName = "A Jornada dos Heróis";
  const data = {
    name: campaignName,
    description: "Uma campanha de teste para iniciar as aventuras.",
    creatorId: adminUser.id,
    imageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    isFinished: false
  };
  const existing = await prisma.campaign.findFirst({
    where: { name: campaignName }
  });
  if (existing) {
    await prisma.campaign.update({
      where: { id: existing.id },
      data: { description: data.description, imageUrl: data.imageUrl }
    });
  } else {
    await prisma.campaign.create({ data });
  }
};
