import { AppliedEffect } from '@prisma/client';

export type CreateAppliedEffectDTO = Pick<AppliedEffect, "characterId" | "effectId" | "sourceType" | "duration" | "stacks" | "startedAt" | "expiresAt" | "value" >;
export type UpdateAppliedEffectDTO = Partial<CreateAppliedEffectDTO>;
export type AppliedEffectDTO = AppliedEffect;
export type DeleteAppliedEffectDTO = Pick<AppliedEffect, 'id'>;
