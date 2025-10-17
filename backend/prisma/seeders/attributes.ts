import { PrismaClient, AttributeKind } from "@prisma/client";
const prisma = new PrismaClient();
export const seedAttributes = async () => {
  const existing = await prisma.attributes.findMany({
    select: { name: true }
  });

  const existingNames = new Set(existing.map((a) => a.name));

  const data = [
    { name: "Força", kind: AttributeKind.ATTRIBUTE },
    { name: "Destreza", kind: AttributeKind.ATTRIBUTE },
    { name: "Inteligência", kind: AttributeKind.ATTRIBUTE },
    { name: "Sabedoria", kind: AttributeKind.ATTRIBUTE },
    { name: "Constituição", kind: AttributeKind.ATTRIBUTE },
    { name: "Carisma", kind: AttributeKind.ATTRIBUTE },
    { name: "Destino", kind: AttributeKind.ATTRIBUTE }
  ].filter((a) => !existingNames.has(a.name));

  if (data.length) {
    await prisma.attributes.createMany({ data });
  }
};
