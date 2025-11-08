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
  const existing = await prisma.campaignMember.findUnique({
    where: {
      campaignId_userId: {
        campaignId: data.campaignId,
        userId: data.userId
      }
    }
  });

  if (existing) {
    return prisma.campaignMember.update({
      where: { id: existing.id },
      data: {
        role: data.role ?? existing.role,
        status: data.status ?? existing.status,
        deletedAt: null
      }
    });
  }

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
    where: { campaignId, deletedAt: null },
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
    where: { userId, deletedAt: null },
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
  return prisma.$transaction(async (tx) => {
    const member = await tx.campaignMember.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await tx.characterPerCampaign.updateMany({
      where: {
        campaignId: member.campaignId,
        deletedAt: null,
        character: {
          userId: member.userId
        }
      },
      data: { deletedAt: new Date() }
    });

    return member;
  });
};
