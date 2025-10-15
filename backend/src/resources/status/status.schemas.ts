import Joi from "joi";
import { CreateStatusDTO, UpdateStatusDTO } from "./status.types";

export const createStatusSchema = Joi.object<CreateStatusDTO>({
  characterId: Joi.string().uuid().required(),
  name: Joi.string().required(),
  valueMax: Joi.number().required(),
  valueBonus: Joi.number().required(),
  valueActual: Joi.number().required()
});

export const updateStatusSchema = Joi.object<UpdateStatusDTO>({
  characterId: Joi.string().uuid(),
  name: Joi.string(),
  valueMax: Joi.number(),
  valueBonus: Joi.number(),
  valueActual: Joi.number()
}).min(1);
