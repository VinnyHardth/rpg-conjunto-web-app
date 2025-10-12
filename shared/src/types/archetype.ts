import type { DateTime } from "./common";

export interface ArchetypeDTO {
  id: string;
  name: string;
  hp: number;
  mp: number;
  tp: number;
  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt: DateTime | null;
}

export interface CreateArchetypeDTO {
  name: string;
  hp: number;
  mp: number;
  tp: number;
}

export type UpdateArchetypeDTO = Partial<CreateArchetypeDTO>;

export interface DeleteArchetypeDTO {
  id: string;
}
