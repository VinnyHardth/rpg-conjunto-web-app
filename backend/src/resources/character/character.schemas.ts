import Joi from "joi";

import { charaterType } from "@prisma/client";
import { CreateCharacterDTO, UpdateCharacterDTO } from "./character.types.js";

// Schema para criação de personagem
const createCharacterSchema = Joi.object<CreateCharacterDTO>({
  name: Joi.string().min(2).max(100).required(),
  race: Joi.string().min(2).max(50).required(),
  age: Joi.number().integer().min(0).required(),
  height: Joi.number().min(0).required(),
  money: Joi.number().min(0).required(),
  imageUrl: Joi.string().uri().optional(),
  gender: Joi.string().required(),
  type: Joi.string().valid(...Object.values(charaterType)).required(),
  generation: Joi.number().integer().min(0).required(),
  userId: Joi.string().uuid().required(),
  archetypeId: Joi.string().uuid().required(),
  annotations: Joi.string().min(0).max(1000).optional(),
});

// Schema para atualização de personagem
const updateCharacterSchema = Joi.object<UpdateCharacterDTO>({
  name: Joi.string().min(2).max(100),
  race: Joi.string().min(2).max(50),
  age: Joi.number().integer().min(0),
  height: Joi.number().min(0),
  money: Joi.number().min(0),
  type: Joi.string().valid(...Object.values(charaterType)),
  generation: Joi.number().integer().min(0),
  imageUrl: Joi.string().uri(),
  gender: Joi.string(),
  archetypeId: Joi.string().uuid(),
  annotations: Joi.string().min(0).max(1000),
}).min(1); // Pelo menos um campo deve ser fornecido para atualização

export { createCharacterSchema, updateCharacterSchema };
