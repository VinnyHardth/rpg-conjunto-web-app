import {
  type PrismaClient,
  ComponentType,
  OperationType
} from "@prisma/client";

const MODIFIERS_DATA = [
  {
    effectName: "Regeneração",
    componentName: "HP",
    componentType: ComponentType.STATUS,
    operationType: OperationType.ADD
  },
  {
    effectName: "Veneno",
    componentName: "HP",
    componentType: ComponentType.STATUS,
    operationType: OperationType.ADD
  },
  {
    effectName: "Dano Físico",
    componentName: "HP",
    componentType: ComponentType.STATUS,
    operationType: OperationType.ADD
  },
  {
    effectName: "Dano Mágico",
    componentName: "HP",
    componentType: ComponentType.STATUS,
    operationType: OperationType.ADD
  },
  {
    effectName: "Cura",
    componentName: "HP",
    componentType: ComponentType.STATUS,
    operationType: OperationType.ADD
  },
  {
    effectName: "Restaura Mana",
    componentName: "MP",
    componentType: ComponentType.STATUS,
    operationType: OperationType.ADD
  },
  {
    effectName: "Reduz Mana",
    componentName: "MP",
    componentType: ComponentType.STATUS,
    operationType: OperationType.ADD
  },
  {
    effectName: "Restaura Técnica",
    componentName: "TP",
    componentType: ComponentType.STATUS,
    operationType: OperationType.ADD
  },
  {
    effectName: "Reduz Técnica",
    componentName: "TP",
    componentType: ComponentType.STATUS,
    operationType: OperationType.ADD
  }
];

export const seedEffectModifiers = async (prisma: PrismaClient) => {
  console.log("Seeding effect modifiers...");

  const effects = await prisma.effect.findMany({
    where: {
      name: { in: MODIFIERS_DATA.map((m) => m.effectName) }
    }
  });

  const effectsMap = effects.reduce(
    (acc, effect) => {
      acc[effect.name] = effect.id;
      return acc;
    },
    {} as Record<string, string>
  );

  for (const mod of MODIFIERS_DATA) {
    const effectId = effectsMap[mod.effectName];
    if (!effectId) {
      console.warn(
        `Effect "${mod.effectName}" not found, skipping modifier seed.`
      );
      continue;
    }

    const data = { ...mod, effectId };
    delete (data as any).effectName;

    const existing = await prisma.effectModifier.findFirst({
      where: {
        effectId: data.effectId,
        componentName: data.componentName
      }
    });

    if (existing) {
      await prisma.effectModifier.update({
        where: { id: existing.id },
        data: { operationType: data.operationType }
      });
    } else {
      await prisma.effectModifier.create({ data });
    }
  }
};
