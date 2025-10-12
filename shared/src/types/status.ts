import type { DateTime } from "./common";

export interface StatusDTO {
  id: string;
  characterId: string;
  name: string;
  valueMax: number;
  valueBonus: number;
  valueActual: number;
  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt: DateTime | null;
}

export interface CreateStatusDTO {
  characterId: string;
  name: string;
  valueMax: number;
  valueBonus: number;
  valueActual: number;
}

export type UpdateStatusDTO = Partial<CreateStatusDTO>;

export interface DeleteStatusDTO {
  id: string;
}
