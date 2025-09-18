import Joi from "joi";

import { CreateUserDTO, UpdateUserDTO } from "./user.types.js";

const createUserSchema = Joi.object<CreateUserDTO>({
    email: Joi.string().email().required(),
    nickname: Joi.string().min(2).max(50).required(),
    password: Joi.string().min(6).max(100).required(),
    imageUrl: Joi.string().uri().optional(),
});

const updateUserSchema = Joi.object<UpdateUserDTO>({
    email: Joi.string().email(),
    nickname: Joi.string().min(2).max(50),
    password: Joi.string().min(6).max(100),
    imageUrl: Joi.string().uri(),
}).min(1); // At least one field must be provided for update

export { createUserSchema, updateUserSchema };