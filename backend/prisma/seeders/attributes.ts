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
  { name: "Percepção", kind: AttributeKind.EXPERTISE },
  { name: "Intimidar", kind: AttributeKind.EXPERTISE },
  { name: "Fé", kind: AttributeKind.EXPERTISE },
  { name: "Inspiração", kind: AttributeKind.EXPERTISE },
  { name: "Determinação", kind: AttributeKind.EXPERTISE },
  { name: "Lábia", kind: AttributeKind.EXPERTISE },
  { name: "Reflexos", kind: AttributeKind.EXPERTISE },
  { name: "Atletismo", kind: AttributeKind.EXPERTISE },
  { name: "Intuição", kind: AttributeKind.EXPERTISE },
  { name: "Furtividade", kind: AttributeKind.EXPERTISE },
  { name: "Sobrevivência", kind: AttributeKind.EXPERTISE },
  { name: "Investigação", kind: AttributeKind.EXPERTISE },
  { name: "Conhecimento1", kind: AttributeKind.EXPERTISE },
  { name: "Conhecimento2", kind: AttributeKind.EXPERTISE },
  { name: "Conhecimento3", kind: AttributeKind.EXPERTISE },
  { name: "Ladinagem", kind: AttributeKind.EXPERTISE },
  { name: "Arma Branca", kind: AttributeKind.EXPERTISE },
  { name: "Arma de Fogo", kind: AttributeKind.EXPERTISE },
  { name: "Detectar Magia", kind: AttributeKind.EXPERTISE },
  { name: "Conjuração", kind: AttributeKind.EXPERTISE },
  { name: "Técnico", kind: AttributeKind.EXPERTISE },
  { name: "Engenharia", kind: AttributeKind.EXPERTISE },
  { name: "Pilotar", kind: AttributeKind.EXPERTISE },
  { name: "Adestrar", kind: AttributeKind.EXPERTISE },
  { name: "Psicanálise", kind: AttributeKind.EXPERTISE },
  { name: "Pontaria", kind: AttributeKind.EXPERTISE },
  { name: "Sentidos", kind: AttributeKind.EXPERTISE },
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
