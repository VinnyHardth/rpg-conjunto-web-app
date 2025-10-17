import { PrismaClient, AttributeKind } from "@prisma/client";

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

  for (const ch of chars) {
    // 2. Prepara os dados para os atributos principais com valor base 5
    const baseAttributesData = baseAttributesDef.map((attr) => ({
      characterId: ch.id,
      attributeId: attr.id,
      valueBase: 5,
      valueInv: 0,
      valueExtra: 0
    }));

    await prisma.characterAttribute.createMany({
      data: baseAttributesData,
      skipDuplicates: true
    });

    // 3. Prepara os dados para as perícias com valor base 0
    const expertisesData = expertisesDef.map((exp) => ({
      characterId: ch.id,
      attributeId: exp.id,
      valueBase: 0,
      valueInv: 0,
      valueExtra: 0
    }));

    // Insere as perícias para o personagem
    await prisma.characterAttribute.createMany({
      data: expertisesData,
      skipDuplicates: true
    });
  }
};
