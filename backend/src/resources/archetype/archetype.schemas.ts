import Joi from "joi";
import { CreateArchetypeDTO, UpdateArchetypeDTO } from "./archetype.types";

export const createArchetypeSchema = Joi.object<CreateArchetypeDTO>({
  name: Joi.string().required(),
  hp: Joi.number().integer().min(0).required(),
  mp: Joi.number().integer().min(0).required(),
  tp: Joi.number().integer().min(0).required()
});

export const updateArchetypeSchema = Joi.object<UpdateArchetypeDTO>({
  name: Joi.string(),
  hp: Joi.number().integer().min(0),
  mp: Joi.number().integer().min(0),
  tp: Joi.number().integer().min(0)
}).min(1);
