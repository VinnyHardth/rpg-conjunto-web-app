import Joi from "joi";

import { CreateCharacterDTO, UpdateCharacterDTO } from "./character.types.js";

const createCharacterSchema = Joi.object<CreateCharacterDTO>({
    name: Joi.string().min(2).max(100).required(),
    nickname: Joi.string().min(2).max(50).required(),
    description: Joi.string().max(500),
    imageUrl: Joi.string().uri(),
    userId: Joi.number().integer().positive().required(),
});

const updateCharacterSchema = Joi.object<UpdateCharacterDTO>({
    name: Joi.string().min(2).max(100),
    nickname: Joi.string().min(2).max(50),
    description: Joi.string().max(500),
    imageUrl: Joi.string().uri(),
    userId: Joi.number().integer().positive(),
}).min(1); // At least one field must be provided for update

export { createCharacterSchema, updateCharacterSchema };