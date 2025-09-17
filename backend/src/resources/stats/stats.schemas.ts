import Joi from "joi";

import { createStatsDTO, updateStatsDTO } from "./stats.types.js";

const createStatsSchema = Joi.object<createStatsDTO>({
    strength: Joi.number().integer().min(0).required(),
    dexterity: Joi.number().integer().min(0).required(),
    constitution: Joi.number().integer().min(0).required(),
    intelligence: Joi.number().integer().min(0).required(),
    wisdom: Joi.number().integer().min(0).required(),
    charisma: Joi.number().integer().min(0).required(),
    destiny: Joi.number().integer().min(0).required(),
    characterId: Joi.string().uuid().required(),
});

const updateStatsSchema = Joi.object<updateStatsDTO>({
    strength: Joi.number().integer().min(0),
    dexterity: Joi.number().integer().min(0),
    constitution: Joi.number().integer().min(0),
    intelligence: Joi.number().integer().min(0),
    wisdom: Joi.number().integer().min(0),
    destiny: Joi.number().integer().min(0),
    charisma: Joi.number().integer().min(0),
}).min(1); // At least one field must be provided for update

export { createStatsSchema, updateStatsSchema };