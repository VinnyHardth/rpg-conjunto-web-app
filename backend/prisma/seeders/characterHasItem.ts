import { PrismaClient, EquipSlot } from "@prisma/client";
export const seedCharacterHasItem = async (prisma: PrismaClient) => {
  const char = await prisma.character.findFirst();
  const sword = await prisma.items.findFirst({
    where: { name: "Espada de Ferro" }
  });
  const potion = await prisma.items.findFirst({
    where: { name: "Poção de Cura" }
  });
  if (!char || !sword || !potion) return;
  await prisma.characterHasItem.createMany({
    data: [
      {
        characterId: char.id,
        itemId: sword.id,
        quantity: 1,
        is_equipped: true,
        equipped_slot: EquipSlot.HAND
      },
      {
        characterId: char.id,
        itemId: potion.id,
        quantity: 2,
        is_equipped: false,
        equipped_slot: EquipSlot.NONE
      }
    ],
    skipDuplicates: true
  });
};
