import { Inventory } from "@prisma/client";

type CreateInventoryDTO = Pick<Inventory, "name" | "description" | "quantity" | "type" | "equipped" | "slot" | "characterId">;
type UpdateInventoryDTO = Partial<Omit<InventoryDTO, "characterId">>;
type DeleteInventoryDTO = Pick<Inventory, "id">;
type InventoryDTO = Inventory;

export {
    CreateInventoryDTO,
    UpdateInventoryDTO,
    DeleteInventoryDTO,
    InventoryDTO,
};