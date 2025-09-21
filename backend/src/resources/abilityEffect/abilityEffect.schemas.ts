import Joi from 'joi';
import { CreateAbilityEffectDTO, UpdateAbilityEffectDTO } from './abilityEffect.types';

export const createAbilityEffectSchema = Joi.object<CreateAbilityEffectDTO>({
    abilityId: Joi.string().uuid().required(),
    effectId: Joi.string().uuid().required(),
});

export const updateAbilityEffectSchema = Joi.object<UpdateAbilityEffectDTO>({
    abilityId: Joi.string().uuid(),
    effectId: Joi.string().uuid(),
}).min(1);
