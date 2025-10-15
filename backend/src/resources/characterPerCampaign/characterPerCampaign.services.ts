import { PrismaClient } from "@prisma/client";

import {
  CharacterPerCampaignDTO,
  CharacterPerCampaignWithCharacterDTO,
  CreateCharacterPerCampaignDTO,
  UpdateCharacterPerCampaignDTO
} from "./characterPerCampaign.types";

const prisma = new PrismaClient();

export const createCharacterPerCampaign = async (
  data: CreateCharacterPerCampaignDTO
): Promise<CharacterPerCampaignDTO> => {
  const existing = await prisma.characterPerCampaign.findFirst({
    where: {
      campaignId: data.campaignId,
      characterId: data.characterId
    }
  });

  if (existing) {
    return prisma.characterPerCampaign.update({
      where: { id: existing.id },
      data: {
        role: data.role ?? existing.role,
        deletedAt: null
      }
    });
  }

  return prisma.characterPerCampaign.create({ data });
};

export const getCharacterPerCampaignById = async (
  id: string
): Promise<CharacterPerCampaignDTO | null> => {
  return prisma.characterPerCampaign.findUnique({ where: { id } });
};

export const getCharacterPerCampaigns = async (): Promise<
  CharacterPerCampaignDTO[]
> => {
  return prisma.characterPerCampaign.findMany();
};

export const getCharacterPerCampaignsByCampaignId = async (
  campaignId: string
): Promise<CharacterPerCampaignDTO[]> => {
  return prisma.characterPerCampaign.findMany({ where: { campaignId } });
};

export const getCharacterPerCampaignsByCharacterId = async (
  characterId: string
): Promise<CharacterPerCampaignDTO[]> => {
  return prisma.characterPerCampaign.findMany({ where: { characterId } });
};

export const updateCharacterPerCampaign = async (
  id: string,
  data: UpdateCharacterPerCampaignDTO
): Promise<CharacterPerCampaignDTO> => {
  return prisma.characterPerCampaign.update({ where: { id }, data });
};

export const deleteCharacterPerCampaign = async (
  id: string
): Promise<CharacterPerCampaignDTO> => {
  return prisma.characterPerCampaign.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
};

export const getCharacterPerCampaignWithCharacterById = async (
  id: string
): Promise<CharacterPerCampaignWithCharacterDTO | null> => {
  return prisma.characterPerCampaign.findUnique({
    where: { id },
    include: {
      character: true
    }
  }) as unknown as CharacterPerCampaignWithCharacterDTO | null;
};
