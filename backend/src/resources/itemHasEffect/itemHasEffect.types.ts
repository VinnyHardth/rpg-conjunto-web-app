import { ItemHasEffect } from '@prisma/client';

export type CreateItemHasEffectDTO = Pick<ItemHasEffect, "effectsId" | "itemId" >;
export type UpdateItemHasEffectDTO = Partial<CreateItemHasEffectDTO>;
export type ItemHasEffectDTO = ItemHasEffect;
export type DeleteItemHasEffectDTO = Pick<ItemHasEffect, 'id'>;
