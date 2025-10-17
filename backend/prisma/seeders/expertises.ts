import { PrismaClient, AttributeKind } from "@prisma/client";
export const seedExpertises = async (prisma: PrismaClient) => {
  const existing = await prisma.attributes.findMany({
    where: { kind: AttributeKind.EXPERTISE },
    select: { name: true }
  });

  const existingNames = new Set(existing.map((e) => e.name));

  const data = [
    { name: "Res. Mágica", kind: AttributeKind.EXPERTISE },
    { name: "Res. Física", kind: AttributeKind.EXPERTISE },
    { name: "Percepção", kind: AttributeKind.EXPERTISE },
    { name: "Intimidar", kind: AttributeKind.EXPERTISE },
    { name: "Fé", kind: AttributeKind.EXPERTISE },
    { name: "Inspiração", kind: AttributeKind.EXPERTISE },
    { name: "Determinação", kind: AttributeKind.EXPERTISE },
    { name: "Lábia", kind: AttributeKind.EXPERTISE },
    { name: "Reflexos", kind: AttributeKind.EXPERTISE }
  ].filter((e) => !existingNames.has(e.name));

  if (data.length > 0) {
    await prisma.attributes.createMany({ data });
  }
};
