import { PrismaClient } from "@prisma/client";

import {
  CampaignMemberDTO,
  CampaignMemberWithUserDTO,
  CreateCampaignMemberDTO,
  UpdateCampaignMemberDTO
} from "./campaignMember.types";

const prisma = new PrismaClient();

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
  const members = await prisma.campaignMember.findMany({
    where: { campaignId }
  });

  if (members.length === 0) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: { id: { in: members.map((member) => member.userId) } },
    select: {
      id: true,
      nickname: true,
      email: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true
    }
  });

  const userMap = new Map(users.map((user) => [user.id, user]));

  return members.map((member) => ({
    ...member,
    user: userMap.get(member.userId) ?? null
  }));
};

export const getCampaignMembersByUserId = async (
  userId: string
): Promise<CampaignMemberDTO[]> => {
  return prisma.campaignMember.findMany({ where: { userId } });
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
