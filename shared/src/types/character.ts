import type { DateTime, DecimalInput, DecimalValue } from "./common";
import type { CharacterType } from "../enums";

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
