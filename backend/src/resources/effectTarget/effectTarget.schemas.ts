import Joi from 'joi';

import { TargetType } from '@prisma/client';
import { CreateEffectTargetDTO, UpdateEffectTargetDTO } from './effectTarget.types';

export const createEffectTargetSchema = Joi.object<CreateEffectTargetDTO>({
  effectId: Joi.string().uuid().required(),
  targetCode: Joi.string().required(),
  targetType: Joi.string().valid(...Object.values(TargetType)).required(),
  value: Joi.number().required(),
});

export const updateEffectTargetSchema = Joi.object<UpdateEffectTargetDTO>({
  effectId: Joi.string().uuid(),
  targetCode: Joi.string(),
  targetType: Joi.string().valid(...Object.values(TargetType)),
  value: Joi.number(),
}).min(1);
