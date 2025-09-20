import { Skill } from '@prisma/client';

export type CreateSkillDTO = Pick<Skill, "characterId" | "abilityId" | "cooldown" | "useType">;
export type UpdateSkillDTO = Partial<CreateSkillDTO>;
export type SkillDTO = Skill;
export type DeleteSkillDTO = Pick<Skill, 'id'>;
