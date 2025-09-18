import Joi from 'joi';
import { CreateEffectDTO, UpdateEffectDTO } from './effect.types';

export const createEffectSchema = Joi.object<CreateEffectDTO>({
    name: Joi.string().max(100).required(),
    imgUrl: Joi.string().uri().optional(),
});

export const updateEffectSchema = Joi.object<UpdateEffectDTO>({
    name: Joi.string().max(100),
    imgUrl: Joi.string().uri(),
}).min(1);
