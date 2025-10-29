import Joi from "joi";

export const rollDifficultySchema = Joi.object({
  campaignId: Joi.string().required(),
  characterId: Joi.string().required(),
  attributeName: Joi.string().required(),
  attributeAbbreviation: Joi.string().required(),
  attributeValue: Joi.number().required(),
  expertiseName: Joi.string().allow(null, ""),
  expertiseValue: Joi.number().allow(null),
  miscBonus: Joi.number().allow(null)
});

export const rollCustomSchema = Joi.object({
  expression: Joi.string().trim().min(1).required()
});

export const clearDiceSchema = Joi.object({
  campaignId: Joi.string().required()
});
