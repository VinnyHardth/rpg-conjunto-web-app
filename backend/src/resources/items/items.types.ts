import { Items } from '@prisma/client';

export type CreateItemsDTO = Pick<Items, "name" | "description" | "imageURL" | "value" | "itemType">;
export type UpdateItemsDTO = Partial<CreateItemsDTO>;
export type ItemsDTO = Items;
export type DeleteItemsDTO = Pick<Items, 'id'>;
