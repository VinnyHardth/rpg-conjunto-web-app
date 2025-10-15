import Joi from "joi";

import { CampaignMemberRole } from "@prisma/client";
import {
  CreateCampaignMemberDTO,
  UpdateCampaignMemberDTO
} from "./campaignMember.types";

export const createCampaignMemberSchema = Joi.object<CreateCampaignMemberDTO>({
  status: Joi.string().allow(null, "").max(191).optional(),
  role: Joi.string()
    .valid(...Object.values(CampaignMemberRole))
    .optional(),
  campaignId: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required()
});

export const updateCampaignMemberSchema = Joi.object<UpdateCampaignMemberDTO>({
  status: Joi.string().allow(null, "").max(191),
  role: Joi.string().valid(...Object.values(CampaignMemberRole)),
  campaignId: Joi.string().uuid(),
  userId: Joi.string().uuid()
}).min(1);
