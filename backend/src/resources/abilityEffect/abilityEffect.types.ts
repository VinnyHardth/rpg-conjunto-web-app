import { AbilityEffect } from "@prisma/client";

export type CreateAbilityEffectDTO = Pick<
  AbilityEffect,
  "abilityId" | "effectId" | "formula"
>;
export type UpdateAbilityEffectDTO = Partial<CreateAbilityEffectDTO>;
export type AbilityEffectDTO = AbilityEffect;
export type DeleteAbilityEffectDTO = Pick<AbilityEffect, "id">;
