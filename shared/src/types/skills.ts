import type { DateTime } from "./common";
import type { SkillUseType } from "../enums";

export interface SkillDTO {
  id: string;
  characterId: string;
  abilityId: string;
  cooldown: number;
  useType: SkillUseType;
  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt: DateTime | null;
}

export interface CreateSkillDTO {
  characterId: string;
  abilityId: string;
  cooldown?: number;
  useType?: SkillUseType;
}

export type UpdateSkillDTO = Partial<CreateSkillDTO>;

export interface DeleteSkillDTO {
  id: string;
}
