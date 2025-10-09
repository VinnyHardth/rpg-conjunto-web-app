import { EffectModifier } from "@prisma/client";

export type CreateEffectModifierDTO = Pick<
  EffectModifier,
  "effectId" | "componentName" | "componentType" | "operationType"
>;
export type UpdateEffectModifierDTO = Partial<CreateEffectModifierDTO>;
export type EffectModifierDTO = EffectModifier;
export type DeleteEffectModifierDTO = Pick<EffectModifier, "id">;
