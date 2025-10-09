import Joi from "joi";

import { SourceType } from "@prisma/client";
import {
  CreateAppliedEffectDTO,
  UpdateAppliedEffectDTO,
} from "./appliedEffect.types";

export const createAppliedEffectSchema = Joi.object<CreateAppliedEffectDTO>({
  characterId: Joi.string().uuid().required(),
  effectId: Joi.string().uuid().required(),
  sourceType: Joi.string()
    .valid(...Object.values(SourceType))
    .required(),
  duration: Joi.number().integer().min(0).required(),
  startedAt: Joi.number().integer().min(0).required(),
  expiresAt: Joi.number().integer().min(0).required(),
  stacks: Joi.number().integer().min(0).required(),
  value: Joi.number().integer().min(0).required(),
});

export const updateAppliedEffectSchema = Joi.object<UpdateAppliedEffectDTO>({
  characterId: Joi.string().uuid(),
  effectId: Joi.string().uuid(),
  sourceType: Joi.string().valid(...Object.values(SourceType)),
  duration: Joi.number().integer().min(0),
  startedAt: Joi.number().integer().min(0).required(),
  expiresAt: Joi.number().integer().min(0).required(),
  stacks: Joi.number().integer().min(0),
  value: Joi.number().integer().min(0),
}).min(1);
