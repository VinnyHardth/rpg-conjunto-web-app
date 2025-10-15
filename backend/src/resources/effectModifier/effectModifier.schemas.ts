import Joi from "joi";

import { ComponentType, OperationType } from "@prisma/client";
import {
  CreateEffectModifierDTO,
  UpdateEffectModifierDTO
} from "./effectModifier.types";

export const createEffectTargetSchema = Joi.object<CreateEffectModifierDTO>({
  effectId: Joi.string().uuid().required(),
  componentType: Joi.string()
    .valid(...Object.values(ComponentType))
    .required(),
  componentName: Joi.string().required(),
  operationType: Joi.string()
    .valid(...Object.values(OperationType))
    .required()
});

export const updateEffectTargetSchema = Joi.object<UpdateEffectModifierDTO>({
  effectId: Joi.string().uuid(),
  componentType: Joi.string().valid(...Object.values(ComponentType)),
  componentName: Joi.string(),
  operationType: Joi.string().valid(...Object.values(OperationType))
}).min(1);
