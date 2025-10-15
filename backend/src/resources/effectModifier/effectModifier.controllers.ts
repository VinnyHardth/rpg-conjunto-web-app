import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import {
  createEffectModifier,
  getEffectModifierById,
  getEffectModifiers,
  updateEffectModifier,
  deleteEffectModifier
} from "./effectModifier.services";

const handleError = (res: Response, err: any, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR
  });
};

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create a new EffectModifier'
    #swagger.description = 'Endpoint to create a new EffectModifier.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/CreateEffectModifierDTO' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'EffectModifier created successfully.',
      schema: { $ref: '#/definitions/EffectModifierDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const EffectModifierData = req.body;

  try {
    const newEffectModifier = await createEffectModifier(EffectModifierData);
    res.status(StatusCodes.CREATED).json(newEffectModifier);
  } catch (err) {
    handleError(res, err, "Error creating EffectModifier");
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get EffectModifier by ID'
    #swagger.description = 'Endpoint to retrieve a EffectModifier by ID.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the EffectModifier to retrieve',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'EffectModifier retrieved successfully.',
      schema: { $ref: '#/definitions/EffectModifierDTO' }
    }
    #swagger.responses[404] = { description: 'EffectModifier not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const EffectModifier = await getEffectModifierById(id);
    if (!EffectModifier) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "EffectModifier not found" });
      return;
    }
    res.status(StatusCodes.OK).json(EffectModifier);
  } catch (err) {
    handleError(res, err, "Error retrieving EffectModifier");
  }
};

const getAll = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get all EffectModifiers'
    #swagger.description = 'Endpoint to retrieve all EffectModifiers.'
    #swagger.responses[200] = {
      description: 'EffectModifiers retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/EffectModifierDTO' } }
    }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  try {
    const EffectModifiers = await getEffectModifiers();
    res.status(StatusCodes.OK).json(EffectModifiers);
  } catch (err) {
    handleError(res, err, "Error retrieving EffectModifiers");
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Update a EffectModifier'
    #swagger.description = 'Endpoint to update an existing EffectModifier.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the EffectModifier to update',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/UpdateEffectModifierDTO' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'EffectModifier updated successfully.',
      schema: { $ref: '#/definitions/EffectModifierDTO' }
    }
    #swagger.responses[404] = { description: 'EffectModifier not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedEffectModifier = await updateEffectModifier(id, updateData);
    res.status(StatusCodes.OK).json(updatedEffectModifier);
  } catch (err) {
    handleError(res, err, "Error updating EffectModifier");
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Delete a EffectModifier'
    #swagger.description = 'Endpoint to delete a EffectModifier.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the EffectModifier to delete',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'EffectModifier deleted successfully.',
      schema: { $ref: '#/definitions/EffectModifierDTO' }
    }
    #swagger.responses[404] = { description: 'EffectModifier not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const deletedEffectModifier = await deleteEffectModifier(id);
    res.status(StatusCodes.OK).json(deletedEffectModifier);
  } catch (err) {
    handleError(res, err, "Error deleting EffectModifier");
  }
};

export default { create, getById, getAll, update, remove };
