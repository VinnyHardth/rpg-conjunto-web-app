import Joi from "joi";

export const rollDifficultySchema = Joi.object({
  campaignId: Joi.string().required(),
  characterId: Joi.string().required(),
  attributeName: Joi.string().required(),
  attributeAbbreviation: Joi.string().required(),
  diceCount: Joi.number().integer().min(1).required(),
  difficulty: Joi.string().valid("Fácil", "Médio", "Difícil").required()
});

export const rollCustomSchema = Joi.object({
  expression: Joi.string().trim().min(1).required()
});

export const clearDiceSchema = Joi.object({
  campaignId: Joi.string().required()
});
