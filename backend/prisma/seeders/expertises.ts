import { PrismaClient, AttributeKind } from "@prisma/client";
const prisma = new PrismaClient();
export const seedExpertises = async () => {
  await prisma.attributes.createMany({
    data: [
      { name: "Espadas", kind: AttributeKind.EXPERTISE },
      { name: "Arcanismo", kind: AttributeKind.EXPERTISE },
    ],
    skipDuplicates: true,
  });
};
