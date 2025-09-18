import Joi from 'joi';
import { CreateAbilitiesDTO, UpdateAbilitiesDTO } from './abilities.types';

export const createAbilitiesSchema = Joi.object<CreateAbilitiesDTO>({
    name: Joi.string().max(100).required(),
    description: Joi.string().max(1000).required(),
    imageURL: Joi.string().uri().required(),
    cost_type: Joi.string().max(100).required(),
    mp_cost: Joi.number().integer().min(0).required(),
    tp_cost: Joi.number().integer().min(0).required(),
    cooldown_value: Joi.number().integer().min(0).required(),
});

export const updateAbilitiesSchema = Joi.object<UpdateAbilitiesDTO>({
    name: Joi.string().max(100),
    description: Joi.string().max(1000),
    imageURL: Joi.string().uri(),
    cost_type: Joi.string().max(100),
    mp_cost: Joi.number().integer().min(0),
    tp_cost: Joi.number().integer().min(0),
    cooldown_value: Joi.number().integer().min(0),
}).min(1);
