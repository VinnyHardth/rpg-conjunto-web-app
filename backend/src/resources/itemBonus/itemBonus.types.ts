import { ItemBonus } from "@prisma/client";

type CreateItemBonusDTO = Pick<ItemBonus, "itemId" | "attribute" | "type" | "value">;
type UpdateItemBonusDTO = Partial<Omit<ItemBonusDTO, "itemId">>;
type DeleteItemBonusDTO = Pick<ItemBonus, "id">;
type ItemBonusDTO = ItemBonus;

export {
    CreateItemBonusDTO,
    UpdateItemBonusDTO,
    DeleteItemBonusDTO,
    ItemBonusDTO,
};