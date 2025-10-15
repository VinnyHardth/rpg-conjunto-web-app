import Joi from "joi";

import { CampaignCharacterRole } from "@prisma/client";
import {
  CreateCharacterPerCampaignDTO,
  UpdateCharacterPerCampaignDTO
} from "./characterPerCampaign.types";

export const createCharacterPerCampaignSchema =
  Joi.object<CreateCharacterPerCampaignDTO>({
    campaignId: Joi.string().uuid().required(),
    characterId: Joi.string().uuid().required(),
    role: Joi.string()
      .valid(...Object.values(CampaignCharacterRole))
      .optional()
  });

export const updateCharacterPerCampaignSchema =
  Joi.object<UpdateCharacterPerCampaignDTO>({
    campaignId: Joi.string().uuid(),
    characterId: Joi.string().uuid(),
    role: Joi.string().valid(...Object.values(CampaignCharacterRole))
  }).min(1);
