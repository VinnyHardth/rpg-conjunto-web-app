import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { createEffectTarget, getEffectTargetById, getEffectTargets, updateEffectTarget, deleteEffectTarget } from './effectTarget.services';

const handleError = (res: Response, err: any, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
};

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create a new effecttarget'
    #swagger.description = 'Endpoint to create a new effecttarget.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/CreateEffectTargetDTO' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'EffectTarget created successfully.',
      schema: { $ref: '#/definitions/EffectTargetDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const effecttargetData = req.body;

  try {
    const newEffectTarget = await createEffectTarget(effecttargetData);
    res.status(StatusCodes.CREATED).json(newEffectTarget);
  } catch (err) {
    handleError(res, err, 'Error creating effecttarget');
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get effecttarget by ID'
    #swagger.description = 'Endpoint to retrieve a effecttarget by ID.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the effecttarget to retrieve',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'EffectTarget retrieved successfully.',
      schema: { $ref: '#/definitions/EffectTargetDTO' }
    }
    #swagger.responses[404] = { description: 'EffectTarget not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const effecttarget = await getEffectTargetById(id);
    if (!effecttarget) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'EffectTarget not found' });
      return;
    }
    res.status(StatusCodes.OK).json(effecttarget);
  } catch (err) {
    handleError(res, err, 'Error retrieving effecttarget');
  }
};

const getAll = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get all effecttargets'
    #swagger.description = 'Endpoint to retrieve all effecttargets.'
    #swagger.responses[200] = {
      description: 'EffectTargets retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/EffectTargetDTO' } }
    }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  try {
    const effecttargets = await getEffectTargets();
    res.status(StatusCodes.OK).json(effecttargets);
  } catch (err) {
    handleError(res, err, 'Error retrieving effecttargets');
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Update a effecttarget'
    #swagger.description = 'Endpoint to update an existing effecttarget.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the effecttarget to update',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/UpdateEffectTargetDTO' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'EffectTarget updated successfully.',
      schema: { $ref: '#/definitions/EffectTargetDTO' }
    }
    #swagger.responses[404] = { description: 'EffectTarget not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedEffectTarget = await updateEffectTarget(id, updateData);
    res.status(StatusCodes.OK).json(updatedEffectTarget);
  } catch (err) {
    handleError(res, err, 'Error updating effecttarget');
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Delete a effecttarget'
    #swagger.description = 'Endpoint to delete a effecttarget.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the effecttarget to delete',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'EffectTarget deleted successfully.',
      schema: { $ref: '#/definitions/EffectTargetDTO' }
    }
    #swagger.responses[404] = { description: 'EffectTarget not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const deletedEffectTarget = await deleteEffectTarget(id);
    res.status(StatusCodes.OK).json(deletedEffectTarget);
  } catch (err) {
    handleError(res, err, 'Error deleting effecttarget');
  }
};

export default { create, getById, getAll, update, remove };
