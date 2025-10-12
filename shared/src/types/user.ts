import type { DateTime } from "./common";
import type { CharacterDTO } from "./character";

export interface UserDTO {
  id: string;
  nickname: string;
  email: string;
  imageUrl: string | null;
  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt: DateTime | null;
  characters?: CharacterDTO[];
}

export interface CreateUserDTO {
  email: string;
  nickname: string;
  password: string;
  imageUrl?: string | null;
}

export type UpdateUserDTO = Partial<CreateUserDTO>;

export interface DeleteUserDTO {
  id: string;
}
