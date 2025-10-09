import { ItemSkills } from "@prisma/client";

export type CreateItemSkillsDTO = Pick<
  ItemSkills,
  "abilityId" | "itemId" | "cooldown"
>;
export type UpdateItemSkillsDTO = Partial<CreateItemSkillsDTO>;
export type ItemSkillsDTO = ItemSkills;
export type DeleteItemSkillsDTO = Pick<ItemSkills, "id">;
