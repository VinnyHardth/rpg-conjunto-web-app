import type { PrismaClient } from "@prisma/client";
export const seedStatus = async (prisma: PrismaClient) => {
  const chars = await prisma.character.findMany({
    include: {
      archetype: true,
      attributes: {
        include: {
          attribute: true
        }
      }
    }
  });

  console.log("Seeding character statuses...");
  for (const ch of chars) {
    if (!ch.archetype) {
      console.warn(
        `Personagem ${ch.name} sem arquétipo, pulando cálculo de status.`
      );
      continue;
    }

    // Replica a lógica de cálculo do frontend/backend
    const con =
      ch.attributes.find((a) => a.attribute.name === "Constituição")
        ?.valueBase || 0;
    const str =
      ch.attributes.find((a) => a.attribute.name === "Força")?.valueBase || 0;
    const dex =
      ch.attributes.find((a) => a.attribute.name === "Destreza")?.valueBase ||
      0;
    const int =
      ch.attributes.find((a) => a.attribute.name === "Inteligência")
        ?.valueBase || 0;
    const wis =
      ch.attributes.find((a) => a.attribute.name === "Sabedoria")?.valueBase ||
      0;

    const hpMax =
      10 +
      Math.ceil(
        (con + 0.25 * (str + dex) + 0.25 * (int + wis)) * ch.archetype.hp
      );
    const mpMax = 10 + Math.ceil((int + wis) / 2) * ch.archetype.mp;
    const tpMax = 10 + Math.ceil((dex + str) / 2) * ch.archetype.tp;

    const statuses = [
      { name: "HP", valueMax: hpMax, valueActual: hpMax },
      { name: "MP", valueMax: mpMax, valueActual: mpMax },
      { name: "TP", valueMax: tpMax, valueActual: tpMax }
    ];

    for (const status of statuses) {
      const data = { characterId: ch.id, ...status };
      await prisma.status.upsert({
        where: { characterId_name: { characterId: ch.id, name: status.name } },
        update: { valueMax: data.valueMax }, // Atualiza o valor máximo se o arquétipo mudar
        create: data
      });
    }
  }
};
