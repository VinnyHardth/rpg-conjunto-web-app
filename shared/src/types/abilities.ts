import type { DateTime } from "./common";
import type { CostType } from "../enums";

export interface AbilitiesDTO {
  id: string;
  name: string;
  description: string | null;
  imageURL: string | null;
  cost_type: CostType;
  mp_cost: number;
  tp_cost: number;
  hp_cost: number;
  cooldown_value: number;
  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt: DateTime | null;
}

export interface CreateAbilitiesDTO {
  name: string;
  description?: string | null;
  imageURL?: string | null;
  cost_type?: CostType;
  mp_cost?: number;
  tp_cost?: number;
  hp_cost?: number;
  cooldown_value?: number;
}

export type UpdateAbilitiesDTO = Partial<CreateAbilitiesDTO>;

export interface DeleteAbilitiesDTO {
  id: string;
}
