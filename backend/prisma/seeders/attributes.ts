import { type PrismaClient, AttributeKind } from "@prisma/client";

const ATTRIBUTES_DATA = [
  // Attributes
  { name: "Força", kind: AttributeKind.ATTRIBUTE },
  { name: "Destreza", kind: AttributeKind.ATTRIBUTE },
  { name: "Inteligência", kind: AttributeKind.ATTRIBUTE },
  { name: "Sabedoria", kind: AttributeKind.ATTRIBUTE },
  { name: "Constituição", kind: AttributeKind.ATTRIBUTE },
  { name: "Carisma", kind: AttributeKind.ATTRIBUTE },
  { name: "Destino", kind: AttributeKind.ATTRIBUTE },
  // Expertises
  { name: "Res. Mágica", kind: AttributeKind.EXPERTISE },
  { name: "Res. Física", kind: AttributeKind.EXPERTISE },
  { name: "Percepção", kind: AttributeKind.EXPERTISE },
  { name: "Intimidar", kind: AttributeKind.EXPERTISE },
  { name: "Fé", kind: AttributeKind.EXPERTISE },
  { name: "Inspiração", kind: AttributeKind.EXPERTISE },
  { name: "Determinação", kind: AttributeKind.EXPERTISE },
  { name: "Lábia", kind: AttributeKind.EXPERTISE },
  { name: "Reflexos", kind: AttributeKind.EXPERTISE }
];

export const seedAttributes = async (prisma: PrismaClient) => {
  console.log("Seeding attributes and expertises...");
  for (const attr of ATTRIBUTES_DATA) {
    const existing = await prisma.attributes.findFirst({
      where: { name: attr.name }
    });
    if (existing) {
      await prisma.attributes.update({
        where: { id: existing.id },
        data: { kind: attr.kind }
      });
    } else {
      await prisma.attributes.create({ data: attr });
    }
  }
};
