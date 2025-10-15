import { PrismaClient, AttributeKind } from "@prisma/client";
const prisma = new PrismaClient();
export const seedExpertises = async () => {
  await prisma.attributes.createMany({
    data: [
      { name: "Res. Mágica", kind: AttributeKind.EXPERTISE },
      { name: "Res. Física", kind: AttributeKind.EXPERTISE },
      { name: "Percepção", kind: AttributeKind.EXPERTISE },
      { name: "Intimidar", kind: AttributeKind.EXPERTISE },
      { name: "Fé", kind: AttributeKind.EXPERTISE },
      { name: "Inspiração", kind: AttributeKind.EXPERTISE },
      { name: "Determinação", kind: AttributeKind.EXPERTISE },
      { name: "Lábia", kind: AttributeKind.EXPERTISE },
      { name: "Reflexos", kind: AttributeKind.EXPERTISE }
    ],
    skipDuplicates: true
  });
};
