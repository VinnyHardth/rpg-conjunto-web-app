import { Status } from '@prisma/client';

export type CreateStatusDTO = Pick<Status, "characterId" | "name" | "valueMax" | "valueBonus" | "valueActual">;
export type UpdateStatusDTO = Partial<CreateStatusDTO>;
export type StatusDTO = Status;
export type DeleteStatusDTO = Pick<Status, 'id'>;
