import Joi from 'joi';
import { CreateCharacterAttributeDTO, UpdateCharacterAttributeDTO } from './characterAttribute.types';

export const createCharacterAttributeSchema = Joi.object<CreateCharacterAttributeDTO>({
  characterId: Joi.string().uuid().required(),
  attributeId: Joi.string().uuid().required(),
  valueBase: Joi.number().default(0).required(),
  valueInv: Joi.number().default(0).required(),
  valueExtra: Joi.number().default(0).required()
});

export const updateCharacterAttributeSchema = Joi.object<UpdateCharacterAttributeDTO>({
  characterId: Joi.string().uuid(),
  attributeId: Joi.string().uuid(),
  valueBase: Joi.number(),
  valueInv: Joi.number(),
  valueExtra: Joi.number()
}).min(1);
