import { PrismaClient } from '@prisma/client';
import { CreateStatusDTO, UpdateStatusDTO, StatusDTO } from './status.types';

const prisma = new PrismaClient();

export const createStatus = async (data: CreateStatusDTO): Promise<StatusDTO> => {
  return prisma.status.create({ data });
};

export const getStatusById = async (id: string): Promise<StatusDTO | null> => {
  return prisma.status.findUnique({ where: { id } });
};

export const getStatuss = async (): Promise<StatusDTO[]> => {
  return prisma.status.findMany();
};

export const updateStatus = async (id: string, data: UpdateStatusDTO): Promise<StatusDTO> => {
  return prisma.status.update({ where: { id }, data });
};

export const deleteStatus = async (id: string): Promise<StatusDTO> => {
  return prisma.status.update({ where: { id }, data: { deletedAt: new Date() } });
};
