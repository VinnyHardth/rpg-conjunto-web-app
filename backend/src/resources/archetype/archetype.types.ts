import { Archetype } from "@prisma/client";

type CreateArchetypeDTO = Pick<Archetype, "name" | "hp" | "mp" | "tp">;
type UpdateArchetypeDTO = Partial<CreateArchetypeDTO>;
type DeleteArchetypeDTO = Pick<Archetype, "id">;
type ArchetypeDTO = Archetype;

export type {
  CreateArchetypeDTO,
  UpdateArchetypeDTO,
  DeleteArchetypeDTO,
  ArchetypeDTO,
};
