import { type PrismaClient, AttributeKind } from "@prisma/client";

export const seedCharacterAttributes = async (prisma: PrismaClient) => {
  // 1. Busca todos os atributos e perícias separadamente
  const baseAttributesDef = await prisma.attributes.findMany({
    where: { kind: AttributeKind.ATTRIBUTE }
  });
  const expertisesDef = await prisma.attributes.findMany({
    where: { kind: AttributeKind.EXPERTISE }
  });
  const chars = await prisma.character.findMany({ select: { id: true } });

  if (baseAttributesDef.length === 0 || chars.length === 0) return;

  console.log("Seeding character attributes...");
  for (const ch of chars) {
    const allAttributes = [...baseAttributesDef, ...expertisesDef];

    for (const attr of allAttributes) {
      const isExpertise = attr.kind === AttributeKind.EXPERTISE;
      const data = {
        characterId: ch.id,
        attributeId: attr.id,
        valueBase: isExpertise ? 0 : 5,
        valueInv: 0,
        valueExtra: 0
      };

      await prisma.characterAttribute.upsert({
        where: {
          characterId_attributeId: {
            characterId: ch.id,
            attributeId: attr.id
          }
        },
        update: {}, // Não faz nada se já existir, apenas garante que exista.
        create: data
      });
    }
  }
};
