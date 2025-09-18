import Joi from "joi";
import { CreateCharacterDTO, UpdateCharacterDTO } from "./character.types.js";

// Schema para criação de personagem
const createCharacterSchema = Joi.object<CreateCharacterDTO>({
  name: Joi.string().min(2).max(100).required(),
  race: Joi.string().min(2).max(50).required(),
  age: Joi.number().integer().min(0).required(),
  height: Joi.number().min(0).required(),
  money: Joi.number().min(0).required(),
  imageUrl: Joi.string().uri().optional(),
  userId: Joi.string().uuid().required(),
  characterArchetypeId: Joi.string().uuid().required(),
});

// Schema para atualização de personagem
const updateCharacterSchema = Joi.object<UpdateCharacterDTO>({
  name: Joi.string().min(2).max(100),
  race: Joi.string().min(2).max(50),
  age: Joi.number().integer().min(0),
  height: Joi.number().min(0),
  money: Joi.number().min(0),
  imageUrl: Joi.string().uri(),
  characterArchetypeId: Joi.string().uuid(),
}).min(1); // Pelo menos um campo deve ser fornecido para atualização

export { createCharacterSchema, updateCharacterSchema };
