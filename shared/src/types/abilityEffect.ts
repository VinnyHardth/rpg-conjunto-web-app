import type { DateTime } from "./common";

export interface AbilityEffectDTO {
  id: string;
  abilityId: string;
  effectId: string;
  formula: string | null;
  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt: DateTime | null;
}

export interface CreateAbilityEffectDTO {
  abilityId: string;
  effectId: string;
  formula?: string | null;
}

export type UpdateAbilityEffectDTO = Partial<CreateAbilityEffectDTO>;

export interface DeleteAbilityEffectDTO {
  id: string;
}
