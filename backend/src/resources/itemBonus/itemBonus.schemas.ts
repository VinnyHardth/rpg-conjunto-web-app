import Joi from "joi";

export const createItemBonusSchema = Joi.object({
    itemId: Joi.string().uuid().required(),
    attribute: Joi.string().max(255).required(),
    type: Joi.string().valid("flat", "percentage", "dice").required(),
    value: Joi.string().required(),
});

export const updateItemBonusSchema = Joi.object({
    attribute: Joi.string().max(255),
    type: Joi.string().valid("flat", "percentage", "dice"),
    value: Joi.string(),
}).min(1); // Pelo menos um campo deve ser fornecido

export const deleteItemBonusSchema = Joi.object({
    id: Joi.string().uuid().required(),
});