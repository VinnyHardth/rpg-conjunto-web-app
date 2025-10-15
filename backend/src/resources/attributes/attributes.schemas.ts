import Joi from "joi";

import { AttributeKind } from "@prisma/client";
import { CreateAttributesDTO, UpdateAttributesDTO } from "./attributes.types";

export const createAttributesSchema = Joi.object<CreateAttributesDTO>({
  name: Joi.string().max(100).required(),
  kind: Joi.string()
    .valid(...Object.values(AttributeKind))
    .required()
});

export const updateAttributesSchema = Joi.object<UpdateAttributesDTO>({
  name: Joi.string().max(100),
  kind: Joi.string().valid(...Object.values(AttributeKind))
}).min(1);
