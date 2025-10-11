import { PrismaClient, ComponentType, OperationType } from "@prisma/client";
const prisma = new PrismaClient();
export const seedEffectModifiers = async () => {
  const regen = await prisma.effect.findFirst({
    where: { name: "Regeneração" },
  });
  const poison = await prisma.effect.findFirst({ where: { name: "Veneno" } });
  if (regen) {
    await prisma.effectModifier.createMany({
      data: [
        {
          effectId: regen.id,
          componentName: "HP",
          componentType: ComponentType.STATUS,
          operationType: OperationType.ADD,
        },
      ],
      skipDuplicates: true,
    });
  }
  if (poison) {
    await prisma.effectModifier.createMany({
      data: [
        {
          effectId: poison.id,
          componentName: "HP",
          componentType: ComponentType.STATUS,
          operationType: OperationType.ADD,
        },
      ],
      skipDuplicates: true,
    });
  }
};
