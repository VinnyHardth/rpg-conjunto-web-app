import Joi from "joi";

export const createCharStateSchema = Joi.object({
    characterId: Joi.string().uuid().required(),
});

export const updateCharStateSchema = Joi.object({
    magicRes: Joi.number().integer().min(0),
    fisicalRes: Joi.number().integer().min(0),
    perception: Joi.number().integer().min(0),
    intimidation: Joi.number().integer().min(0),
    faith: Joi.number().integer().min(0),
    inspiration: Joi.number().integer().min(0),
    determination: Joi.number().integer().min(0),
    bluff: Joi.number().integer().min(0),
    reflexes: Joi.number().integer().min(0),
    maxHP: Joi.number().integer().min(0),
    currentHP: Joi.number().integer().min(0),
    maxMP: Joi.number().integer().min(0),
    currentMP: Joi.number().integer().min(0),
    maxXP: Joi.number().integer().min(0),
    currentXP: Joi.number().integer().min(0),
}); // Pelo menos um campo deve ser fornecido

