import { PrismaClient } from "@prisma/client";
import { CreateSkillDTO, UpdateSkillDTO, SkillDTO } from "./skill.types";

const prisma = new PrismaClient();

export const createSkill = async (data: CreateSkillDTO): Promise<SkillDTO> => {
  return prisma.skill.create({ data });
};

export const getSkillByCharacterId = async (
  characterId: string
): Promise<SkillDTO[]> => {
  return prisma.skill.findMany({ where: { characterId } });
};

export const getSkillById = async (id: string): Promise<SkillDTO | null> => {
  return prisma.skill.findUnique({ where: { id } });
};

export const getSkills = async (): Promise<SkillDTO[]> => {
  return prisma.skill.findMany();
};

export const updateSkill = async (
  id: string,
  data: UpdateSkillDTO
): Promise<SkillDTO> => {
  return prisma.skill.update({ where: { id }, data });
};

export const deleteSkill = async (id: string): Promise<SkillDTO> => {
  return prisma.skill.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
};
