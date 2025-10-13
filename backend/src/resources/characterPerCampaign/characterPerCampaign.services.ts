import { PrismaClient } from "@prisma/client";

import {
  CharacterPerCampaignDTO,
  CreateCharacterPerCampaignDTO,
  UpdateCharacterPerCampaignDTO,
} from "./characterPerCampaign.types";

const prisma = new PrismaClient();

export const createCharacterPerCampaign = async (
  data: CreateCharacterPerCampaignDTO,
): Promise<CharacterPerCampaignDTO> => {
  return prisma.characterPerCampaign.create({ data });
};

export const getCharacterPerCampaignById = async (
  id: string,
): Promise<CharacterPerCampaignDTO | null> => {
  return prisma.characterPerCampaign.findUnique({ where: { id } });
};

export const getCharacterPerCampaigns = async (): Promise<
  CharacterPerCampaignDTO[]
> => {
  return prisma.characterPerCampaign.findMany();
};

export const getCharacterPerCampaignsByCampaignId = async (
  campaignId: string,
): Promise<CharacterPerCampaignDTO[]> => {
  return prisma.characterPerCampaign.findMany({ where: { campaignId } });
};

export const getCharacterPerCampaignsByCharacterId = async (
  characterId: string,
): Promise<CharacterPerCampaignDTO[]> => {
  return prisma.characterPerCampaign.findMany({ where: { characterId } });
};

export const updateCharacterPerCampaign = async (
  id: string,
  data: UpdateCharacterPerCampaignDTO,
): Promise<CharacterPerCampaignDTO> => {
  return prisma.characterPerCampaign.update({ where: { id }, data });
};

export const deleteCharacterPerCampaign = async (
  id: string,
): Promise<CharacterPerCampaignDTO> => {
  return prisma.characterPerCampaign.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
