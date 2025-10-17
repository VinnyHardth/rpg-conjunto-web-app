import {
  CampaignMemberDTO,
  CampaignMemberWithUserDTO,
  CreateCampaignMemberDTO,
  UpdateCampaignMemberDTO
} from "./campaignMember.types";

import prisma from "../../prisma";

export const createCampaignMember = async (
  data: CreateCampaignMemberDTO
): Promise<CampaignMemberDTO> => {
  return prisma.campaignMember.create({ data });
};

export const getCampaignMemberById = async (
  id: string
): Promise<CampaignMemberDTO | null> => {
  return prisma.campaignMember.findUnique({ where: { id } });
};

export const getCampaignMembers = async (): Promise<CampaignMemberDTO[]> => {
  return prisma.campaignMember.findMany();
};

export const getCampaignMembersByCampaignId = async (
  campaignId: string
): Promise<CampaignMemberWithUserDTO[]> => {
  // Simplificado para usar o 'include' do Prisma, que é mais eficiente e correto.
  return prisma.campaignMember.findMany({
    where: { campaignId },
    include: {
      user: true // Inclui os dados completos do usuário associado.
    }
  });
};

export const getCampaignMembersByUserId = async (
  userId: string
): Promise<CampaignMemberDTO[]> => {
  // A função foi ajustada para incluir os dados completos da campanha,
  // que é o que o frontend precisa para exibir a lista.
  return prisma.campaignMember.findMany({
    where: { userId },
    include: { campaign: true }
  });
};

export const updateCampaignMember = async (
  id: string,
  data: UpdateCampaignMemberDTO
): Promise<CampaignMemberDTO> => {
  return prisma.campaignMember.update({ where: { id }, data });
};

export const deleteCampaignMember = async (
  id: string
): Promise<CampaignMemberDTO> => {
  return prisma.campaignMember.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
};
