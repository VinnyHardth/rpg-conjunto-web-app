import type { DateTime } from "./common";

export interface CharacterAttributeDTO {
  id: string;
  characterId: string;
  attributeId: string;
  valueBase: number;
  valueInv: number;
  valueExtra: number;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface CreateCharacterAttributeDTO {
  characterId: string;
  attributeId: string;
  valueBase: number;
  valueInv: number;
  valueExtra: number;
}

export type UpdateCharacterAttributeDTO = Partial<CreateCharacterAttributeDTO>;

export interface DeleteCharacterAttributeDTO {
  id: string;
}
