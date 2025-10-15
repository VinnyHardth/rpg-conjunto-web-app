import Joi from "joi";

import { SkillUseType } from "@prisma/client";
import { CreateSkillDTO, UpdateSkillDTO } from "./skill.types";

export const createSkillSchema = Joi.object<CreateSkillDTO>({
  characterId: Joi.string().uuid().required(),
  abilityId: Joi.string().uuid().required(),
  cooldown: Joi.number().integer().required(),
  useType: Joi.string()
    .valid(...Object.values(SkillUseType))
    .required()
});

export const updateSkillSchema = Joi.object<UpdateSkillDTO>({
  characterId: Joi.string().uuid(),
  abilityId: Joi.string().uuid(),
  cooldown: Joi.number().integer(),
  useType: Joi.string().valid(...Object.values(SkillUseType))
}).min(1);
