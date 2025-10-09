import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { Schema } from "joi";

const validateRequestBody = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        message: "Validation error",
        details: error.details.map((detail) => detail.message),
      });
    }
    next();
  };
};

export default validateRequestBody;
