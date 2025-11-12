import { type PrismaClient, EquipSlot } from "@prisma/client";
export const seedCharacterHasItem = async (prisma: PrismaClient) => {
  console.log("Seeding character items...");
  const char = await prisma.character.findFirst({ where: { name: "Tharion" } });
  const sword = await prisma.items.findFirst({
    where: { name: "Espada de Ferro" }
  });
  const potion = await prisma.items.findFirst({
    where: { name: "Poção de Cura" }
  });

  if (!char || !sword || !potion) return;

  const items = [
    {
      itemId: sword.id,
      quantity: 1,
      is_equipped: true,
      equipped_slot: EquipSlot.HAND
    },
    {
      itemId: potion.id,
      quantity: 2,
      is_equipped: false,
      equipped_slot: EquipSlot.NONE
    }
  ];

  for (const item of items) {
    const data = { characterId: char.id, ...item };
    const existing = await prisma.characterHasItem.findFirst({
      where: {
        characterId: char.id,
        itemId: item.itemId
      }
    });

    if (existing) {
      await prisma.characterHasItem.update({
        where: { id: existing.id },
        data: { quantity: data.quantity, is_equipped: data.is_equipped }
      });
    } else {
      await prisma.characterHasItem.create({ data });
    }
  }
};
