import Joi from 'joi';
import { CreateItemHasEffectDTO, UpdateItemHasEffectDTO } from './itemHasEffect.types';

export const createItemHasEffectSchema = Joi.object<CreateItemHasEffectDTO>({
    itemId: Joi.string().uuid().required(),
    effectsId: Joi.string().uuid().required(),
});

export const updateItemHasEffectSchema = Joi.object<UpdateItemHasEffectDTO>({
    itemId: Joi.string().uuid(),
    effectsId: Joi.string().uuid(),
}).min(1);
