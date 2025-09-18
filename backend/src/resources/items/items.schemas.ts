import Joi from 'joi';

import { itemType } from '@prisma/client';
import { CreateItemsDTO, UpdateItemsDTO } from './items.types';

export const createItemsSchema = Joi.object<CreateItemsDTO>({
    name: Joi.string().max(100).required(),
    description: Joi.string().max(1000).optional(),
    imageURL: Joi.string().uri().optional(),
    value: Joi.number().integer().min(0).required(),
    itemType: Joi.string().valid(...Object.values(itemType)).required(),
});

export const updateItemsSchema = Joi.object<UpdateItemsDTO>({
    name: Joi.string().max(100),
    description: Joi.string().max(1000),
    imageURL: Joi.string().uri(),
    value: Joi.number().integer().min(0),
    itemType: Joi.string().valid(...Object.values(itemType)),
}).min(1);
