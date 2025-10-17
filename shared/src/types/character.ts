import type { DateTime, DecimalInput, DecimalValue } from "./common";
import type { CharacterType } from "../enums";
import type { ArchetypeDTO } from "./archetype";
import type { CharacterAttributeDTO, UpdateCharacterAttributeDTO } from "./characterAttribute";
import type { CharacterHasItemDTO, UpdateCharacterHasItemDTO } from "./inventory";
import type { SkillDTO, UpdateSkillDTO } from "./skills";
import type { StatusDTO, UpdateStatusDTO } from "./status";


export interface CharacterDTO {
  id: string;
  name: string;
  race: string | null;
  age: number | null;
  height: number | null;
  gender: string;
  money: DecimalValue;
  annotations: string | null;
  generation: number;
  type: CharacterType;
  imageUrl: string | null;
  userId: string;
  archetypeId: string | null;
  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt: DateTime | null;
}

export interface CreateCharacterDTO {
  name: string;
  race?: string | null;
  age?: number | null;
  height?: number | null;
  gender: string;
  money?: DecimalInput;
  annotations?: string | null;
  imageUrl?: string | null;
  userId: string;
  archetypeId?: string | null;
  generation?: number;
  type: CharacterType;
}

export type UpdateCharacterDTO = Partial<CreateCharacterDTO>;

export interface DeleteCharacterDTO {
  id: string;
}

export type CharacterBasicInfoUpdate = Partial<
  Pick<
    CharacterDTO,
    "name" | "race" | "age" | "height" | "gender" | "annotations" | "imageUrl"
  >
>;

export type FullCharacterData = {
  info: CharacterDTO;
  archetype: ArchetypeDTO | null;
  attributes: CharacterAttributeDTO[];
  status: StatusDTO[];
  inventory: CharacterHasItemDTO[];
  skills: SkillDTO[];
}

export type UpdateFullCharacterDTO = {
  character: UpdateCharacterDTO;
  attributes: UpdateCharacterAttributeDTO[];
  status: UpdateStatusDTO[];
  inventory: UpdateCharacterHasItemDTO[];
  skills: UpdateSkillDTO[];
}
