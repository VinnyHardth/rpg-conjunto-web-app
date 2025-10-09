import Joi from "joi";

import { EquipSlot } from "@prisma/client";
import {
  CreateCharacterHasItemDTO,
  UpdateCharacterHasItemDTO,
} from "./characterHasItem.types";

export const createCharacterHasItemSchema =
  Joi.object<CreateCharacterHasItemDTO>({
    characterId: Joi.string().uuid().required(),
    itemId: Joi.string().uuid().required(),
    quantity: Joi.number().integer().min(0).required(),
    value: Joi.number().integer().min(0).required(),
    is_equipped: Joi.boolean().required(),
    equipped_slot: Joi.string()
      .valid(...Object.values(EquipSlot))
      .required(),
  });

export const updateCharacterHasItemSchema =
  Joi.object<UpdateCharacterHasItemDTO>({
    characterId: Joi.string().uuid(),
    itemId: Joi.string().uuid(),
    quantity: Joi.number().integer().min(0),
    value: Joi.number().integer().min(0),
    is_equipped: Joi.boolean(),
    equipped_slot: Joi.string().valid(...Object.values(EquipSlot)),
  }).min(1);
