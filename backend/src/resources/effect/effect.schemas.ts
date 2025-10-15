import Joi from "joi";
import { DamageType, StackingPolicy } from "@prisma/client";
import { CreateEffectDTO, UpdateEffectDTO } from "./effect.types";

export const createEffectSchema = Joi.object<CreateEffectDTO>({
  name: Joi.string().max(100).required(),
  imgUrl: Joi.string().uri().required(),
  description: Joi.string().max(1000),
  removableBy: Joi.string(),
  damageType: Joi.string()
    .valid(...Object.values(DamageType))
    .required(),
  stackingPolicy: Joi.string()
    .valid(...Object.values(StackingPolicy))
    .required()
});

export const updateEffectSchema = Joi.object<UpdateEffectDTO>({
  name: Joi.string().max(100),
  imgUrl: Joi.string().uri(),
  description: Joi.string().max(1000),
  removableBy: Joi.string(),
  damageType: Joi.string().valid(...Object.values(DamageType)),
  stackingPolicy: Joi.string().valid(...Object.values(StackingPolicy))
}).min(1);
