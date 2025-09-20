import { EffectTarget } from '@prisma/client';

export type CreateEffectTargetDTO = Pick<EffectTarget, "effectId" | "targetCode" | "targetType" | "value">;
export type UpdateEffectTargetDTO = Partial<CreateEffectTargetDTO>;
export type EffectTargetDTO = EffectTarget;
export type DeleteEffectTargetDTO = Pick<EffectTarget, 'id'>;
