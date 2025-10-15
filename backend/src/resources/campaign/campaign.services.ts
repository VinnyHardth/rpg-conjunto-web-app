import { PrismaClient } from "@prisma/client";

import {
  CampaignDTO,
  CreateCampaignDTO,
  UpdateCampaignDTO
} from "./campaign.types";

const prisma = new PrismaClient();

export const createCampaign = async (
  data: CreateCampaignDTO
): Promise<CampaignDTO> => {
  return prisma.campaign.create({ data });
};

export const getCampaignById = async (
  id: string
): Promise<CampaignDTO | null> => {
  return prisma.campaign.findUnique({ where: { id } });
};

export const getCampaigns = async (): Promise<CampaignDTO[]> => {
  return prisma.campaign.findMany();
};

export const getCampaignsByCreatorId = async (
  creatorId: string
): Promise<CampaignDTO[]> => {
  return prisma.campaign.findMany({ where: { creatorId } });
};

export const updateCampaign = async (
  id: string,
  data: UpdateCampaignDTO
): Promise<CampaignDTO> => {
  return prisma.campaign.update({ where: { id }, data });
};

export const deleteCampaign = async (id: string): Promise<CampaignDTO> => {
  return prisma.campaign.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
};
