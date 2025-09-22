import { PrismaClient } from '@prisma/client';
import { AttributeKind } from '@prisma/client';
import { CreateAttributesDTO, UpdateAttributesDTO, AttributesDTO } from './attributes.types';

const prisma = new PrismaClient();

export const createAttributes = async (data: CreateAttributesDTO): Promise<AttributesDTO> => {
  return prisma.attributes.create({ data });
};

export const getAttributesById = async (id: string): Promise<AttributesDTO | null> => {
  return prisma.attributes.findUnique({ where: { id } });
};

export const getAttributes = async (): Promise<AttributesDTO[]> => {
  return prisma.attributes.findMany();
};

export const getAttributesByKind = async (kind: AttributeKind): Promise<AttributesDTO[]> => {
  return prisma.attributes.findMany({ where: { kind } });
};

export const updateAttributes = async (id: string, data: UpdateAttributesDTO): Promise<AttributesDTO> => {
  return prisma.attributes.update({ where: { id }, data });
};

export const deleteAttributes = async (id: string): Promise<AttributesDTO> => {
  return prisma.attributes.delete({ where: { id } });
};
