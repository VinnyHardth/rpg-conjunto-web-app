import Joi from "joi";

import { CreateCampaignDTO, UpdateCampaignDTO } from "./campaign.types";

export const createCampaignSchema = Joi.object<CreateCampaignDTO>({
  name: Joi.string().min(1).max(191).required(),
  description: Joi.string().allow(null, "").max(2000).optional(),
  imageUrl: Joi.string().uri().allow(null, "").max(191).optional(),
  isFinished: Joi.boolean().optional(),
  creatorId: Joi.string().uuid().required()
});

export const updateCampaignSchema = Joi.object<UpdateCampaignDTO>({
  name: Joi.string().min(1).max(191),
  description: Joi.string().allow(null, "").max(2000),
  imageUrl: Joi.string().uri().allow(null, "").max(191),
  isFinished: Joi.boolean(),
  creatorId: Joi.string().uuid()
}).min(1);
