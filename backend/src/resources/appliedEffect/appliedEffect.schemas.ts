import Joi from "joi";
import { SourceType } from "@prisma/client";
import {
  CreateAppliedEffectDTO,
  UpdateAppliedEffectDTO
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
  value: Joi.number().integer().required()
});

export const updateAppliedEffectSchema = Joi.object<UpdateAppliedEffectDTO>({
  characterId: Joi.string().uuid(),
  effectId: Joi.string().uuid(),
  sourceType: Joi.string().valid(...Object.values(SourceType)),
  duration: Joi.number().integer().min(0),
  startedAt: Joi.number().integer().min(0).required(),
  expiresAt: Joi.number().integer().min(0).required(),
  stacks: Joi.number().integer().min(0),
  value: Joi.number().integer()
}).min(1);

// 🆕 Novo schema para aplicação dinâmica de efeitos (rota /apply)
export const applyEffectSchema = Joi.object({
  characterId: Joi.string().uuid().required(),
  effectId: Joi.string().uuid().required(),
  sourceType: Joi.string()
    .valid(...Object.values(SourceType))
    .required(),
  sourceId: Joi.string().uuid().optional(),
  currentTurn: Joi.number().integer().min(0).default(0),
  duration: Joi.number().integer().min(0).required(),
  stacksDelta: Joi.number().integer().default(1),
  valuePerStack: Joi.number().default(0)
});
