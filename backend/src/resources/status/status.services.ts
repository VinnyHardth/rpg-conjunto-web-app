import { CreateStatusDTO, UpdateStatusDTO, StatusDTO } from "./status.types";

import prisma from "../../prisma";
export const createStatus = async (
  data: CreateStatusDTO
): Promise<StatusDTO> => {
  return prisma.status.create({ data });
};

export const getStatusById = async (id: string): Promise<StatusDTO | null> => {
  return prisma.status.findUnique({ where: { id } });
};

export const getStatus = async (): Promise<StatusDTO[]> => {
  return prisma.status.findMany();
};

export const getStatusByCharacterId = async (
  characterId: string
): Promise<StatusDTO[]> => {
  return prisma.status.findMany({ where: { characterId } });
};

export const updateStatus = async (
  id: string,
  data: UpdateStatusDTO
): Promise<StatusDTO> => {
  return prisma.status.update({ where: { id }, data });
};

export const deleteStatus = async (id: string): Promise<StatusDTO> => {
  return prisma.status.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
};
