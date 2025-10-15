import Joi from "joi";
import { CreateItemSkillsDTO, UpdateItemSkillsDTO } from "./itemSkills.types";

export const createItemSkillsSchema = Joi.object<CreateItemSkillsDTO>({
  abilityId: Joi.string().uuid().required(),
  itemId: Joi.string().uuid().required(),
  cooldown: Joi.number().integer().default(0).required()
});

export const updateItemSkillsSchema = Joi.object<UpdateItemSkillsDTO>({
  abilityId: Joi.string().uuid(),
  itemId: Joi.string().uuid(),
  cooldown: Joi.number().integer()
}).min(1);
