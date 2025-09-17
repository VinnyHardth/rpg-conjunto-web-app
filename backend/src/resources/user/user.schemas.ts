import Joi from "joi";

import { CreateUserDTO, UpdateUserDTO } from "./user.types.js";

const createUserSchema = Joi.object<CreateUserDTO>({
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(100).required(),
    nickname: Joi.string().min(2).max(50).required(),
    password: Joi.string().min(6).max(100).required(),
});

const updateUserSchema = Joi.object<UpdateUserDTO>({
    email: Joi.string().email(),
    name: Joi.string().min(2).max(100),
    nickname: Joi.string().min(2).max(50),
    password: Joi.string().min(6).max(100),
}).min(1); // At least one field must be provided for update

export { createUserSchema, updateUserSchema };