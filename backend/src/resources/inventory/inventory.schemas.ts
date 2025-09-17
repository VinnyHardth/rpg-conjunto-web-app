import Joi from "joi";

export const createInventorySchema = Joi.object({
    name: Joi.string().max(255).required(),
    description: Joi.string().max(1000).required(),
    quantity: Joi.number().integer().min(1).required(),
    type: Joi.string().valid("Consumable", "Equipment", "Material", "Quest", "Misc").required(),
    equipped: Joi.boolean(),
    slot: Joi.string().valid("Head", "Body", "Legs", "Weapon", "Shield", "Accessory1", "Accessory2", "Misc").required(),
    characterId: Joi.string().uuid().required(),
});

export const updateInventorySchema = Joi.object({
    name: Joi.string().max(255),
    description: Joi.string().max(1000),
    quantity: Joi.number().integer().min(1),
    type: Joi.string().valid("Consumable", "Equipment", "Material", "Quest", "Misc"),
    equipped: Joi.boolean(),
    slot: Joi.string().valid("Head", "Body", "Legs", "Weapon", "Shield", "Accessory1", "Accessory2", "Misc"),
}).min(1); // Pelo menos um campo deve ser fornecido

export const deleteInventorySchema = Joi.object({
    id: Joi.string().uuid().required(),
});