import { PrismaClient, AttributeKind } from "@prisma/client";
const prisma = new PrismaClient();
export const seedAttributes = async () => {
  await prisma.attributes.createMany({
    data: [
      { name: "Força", kind: AttributeKind.ATTRIBUTE },
      { name: "Destreza", kind: AttributeKind.ATTRIBUTE },
      { name: "Inteligência", kind: AttributeKind.ATTRIBUTE },
      { name: "Sabedoria", kind: AttributeKind.ATTRIBUTE },
      { name: "Constituição", kind: AttributeKind.ATTRIBUTE },
      { name: "Carisma", kind: AttributeKind.ATTRIBUTE },
      { name: "Destino", kind: AttributeKind.ATTRIBUTE },
    ],
    skipDuplicates: true,
  });
};
