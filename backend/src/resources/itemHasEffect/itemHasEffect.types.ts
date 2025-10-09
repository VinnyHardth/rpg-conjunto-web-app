import { ItemHasEffect } from "@prisma/client";

export type CreateItemHasEffectDTO = Pick<
  ItemHasEffect,
  "effectsId" | "itemId" | "formula"
>;
export type UpdateItemHasEffectDTO = Partial<CreateItemHasEffectDTO>;
export type ItemHasEffectDTO = ItemHasEffect;
export type DeleteItemHasEffectDTO = Pick<ItemHasEffect, "id">;
