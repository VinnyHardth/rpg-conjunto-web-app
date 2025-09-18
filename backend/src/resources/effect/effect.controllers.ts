import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { createEffect, getEffectById, getEffects, updateEffect, deleteEffect } from './effect.services';

const handleError = (res: Response, err: any, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
};

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create a new effect'
    #swagger.description = 'Endpoint to create a new effect.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/CreateEffectDTO' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Effect created successfully.',
      schema: { $ref: '#/definitions/EffectDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const effectData = req.body;

  try {
    const newEffect = await createEffect(effectData);
    res.status(StatusCodes.CREATED).json(newEffect);
  } catch (err) {
    handleError(res, err, 'Error creating effect');
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get effect by ID'
    #swagger.description = 'Endpoint to retrieve a effect by ID.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the effect to retrieve',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Effect retrieved successfully.',
      schema: { $ref: '#/definitions/EffectDTO' }
    }
    #swagger.responses[404] = { description: 'Effect not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const effect = await getEffectById(id);
    if (!effect) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Effect not found' });
      return;
    }
    res.status(StatusCodes.OK).json(effect);
  } catch (err) {
    handleError(res, err, 'Error retrieving effect');
  }
};

const getAll = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get all effects'
    #swagger.description = 'Endpoint to retrieve all effects.'
    #swagger.responses[200] = {
      description: 'Effects retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/EffectDTO' } }
    }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  try {
    const effects = await getEffects();
    res.status(StatusCodes.OK).json(effects);
  } catch (err) {
    handleError(res, err, 'Error retrieving effects');
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Update a effect'
    #swagger.description = 'Endpoint to update an existing effect.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the effect to update',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/UpdateEffectDTO' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'Effect updated successfully.',
      schema: { $ref: '#/definitions/EffectDTO' }
    }
    #swagger.responses[404] = { description: 'Effect not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedEffect = await updateEffect(id, updateData);
    res.status(StatusCodes.OK).json(updatedEffect);
  } catch (err) {
    handleError(res, err, 'Error updating effect');
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Delete a effect'
    #swagger.description = 'Endpoint to delete a effect.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the effect to delete',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Effect deleted successfully.',
      schema: { $ref: '#/definitions/EffectDTO' }
    }
    #swagger.responses[404] = { description: 'Effect not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const deletedEffect = await deleteEffect(id);
    res.status(StatusCodes.OK).json(deletedEffect);
  } catch (err) {
    handleError(res, err, 'Error deleting effect');
  }
};

export default { create, getById, getAll, update, remove };
