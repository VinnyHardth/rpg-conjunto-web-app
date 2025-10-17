import { PrismaClient, ComponentType, OperationType } from "@prisma/client";
export const seedEffectModifiers = async (prisma: PrismaClient) => {
  const regen = await prisma.effect.findFirst({
    where: { name: "Regeneração" }
  });
  const poison = await prisma.effect.findFirst({ where: { name: "Veneno" } });
  const physicalDamage = await prisma.effect.findFirst({
    where: { name: "Dano Físico" }
  });
  const magicalDamage = await prisma.effect.findFirst({
    where: { name: "Dano Mágico" }
  });
  const healing = await prisma.effect.findFirst({
    where: { name: "Cura" }
  });
  const reduceMana = await prisma.effect.findFirst({
    where: { name: "Reduz Mana" }
  });
  const reduceTechnique = await prisma.effect.findFirst({
    where: { name: "Reduz Técnica" }
  });
  if (regen) {
    await prisma.effectModifier.createMany({
      data: [
        {
          effectId: regen.id,
          componentName: "HP",
          componentType: ComponentType.STATUS,
          operationType: OperationType.ADD
        }
      ],
      skipDuplicates: true
    });
  }
  if (physicalDamage) {
    await prisma.effectModifier.createMany({
      data: [
        {
          effectId: physicalDamage.id,
          componentName: "HP",
          componentType: ComponentType.STATUS,
          operationType: OperationType.ADD
        }
      ],
      skipDuplicates: true
    });
  }
  if (magicalDamage) {
    await prisma.effectModifier.createMany({
      data: [
        {
          effectId: magicalDamage.id,
          componentName: "HP",
          componentType: ComponentType.STATUS,
          operationType: OperationType.ADD
        }
      ],
      skipDuplicates: true
    });
  }
  if (healing) {
    await prisma.effectModifier.createMany({
      data: [
        {
          effectId: healing.id,
          componentName: "HP",
          componentType: ComponentType.STATUS,
          operationType: OperationType.ADD
        }
      ],
      skipDuplicates: true
    });
  }
  if (reduceMana) {
    await prisma.effectModifier.createMany({
      data: [
        {
          effectId: reduceMana.id,
          componentName: "MP",
          componentType: ComponentType.STATUS,
          operationType: OperationType.ADD
        }
      ],
      skipDuplicates: true
    });
  }
  if (reduceTechnique) {
    await prisma.effectModifier.createMany({
      data: [
        {
          effectId: reduceTechnique.id,
          componentName: "TP",
          componentType: ComponentType.STATUS,
          operationType: OperationType.ADD
        }
      ],
      skipDuplicates: true
    });
  }
  if (poison) {
    await prisma.effectModifier.createMany({
      data: [
        {
          effectId: poison.id,
          componentName: "HP",
          componentType: ComponentType.STATUS,
          operationType: OperationType.ADD
        }
      ],
      skipDuplicates: true
    });
  }
};
