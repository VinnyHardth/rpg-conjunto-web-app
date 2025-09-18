import { Archetype } from '@prisma/client';

export type CreateArchetypeDTO = Pick<Archetype, "name" | "hp" | "mp" | "tp">;
export type UpdateArchetypeDTO = Partial<CreateArchetypeDTO>;
export type DeleteArchetypeDTO = Pick<Archetype, 'id'>;
export type ArchetypeDTO = Archetype;
