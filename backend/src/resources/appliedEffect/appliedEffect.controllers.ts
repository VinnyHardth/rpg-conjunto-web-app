import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import {
  createAppliedEffect,
  getAppliedEffectById,
  getAppliedEffects,
  updateAppliedEffect,
  deleteAppliedEffect
} from "./appliedEffect.services";

const handleError = (res: Response, err: any, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR
  });
};

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create a new appliedeffect'
    #swagger.description = 'Endpoint to create a new appliedeffect.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/CreateAppliedEffectDTO' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'AppliedEffect created successfully.',
      schema: { $ref: '#/definitions/AppliedEffectDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const appliedeffectData = req.body;

  try {
    const newAppliedEffect = await createAppliedEffect(appliedeffectData);
    res.status(StatusCodes.CREATED).json(newAppliedEffect);
  } catch (err) {
    handleError(res, err, "Error creating appliedeffect");
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get appliedeffect by ID'
    #swagger.description = 'Endpoint to retrieve a appliedeffect by ID.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the appliedeffect to retrieve',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'AppliedEffect retrieved successfully.',
      schema: { $ref: '#/definitions/AppliedEffectDTO' }
    }
    #swagger.responses[404] = { description: 'AppliedEffect not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const appliedeffect = await getAppliedEffectById(id);
    if (!appliedeffect) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "AppliedEffect not found" });
      return;
    }
    res.status(StatusCodes.OK).json(appliedeffect);
  } catch (err) {
    handleError(res, err, "Error retrieving appliedeffect");
  }
};

const getAll = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get all appliedeffects'
    #swagger.description = 'Endpoint to retrieve all appliedeffects.'
    #swagger.responses[200] = {
      description: 'AppliedEffects retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/AppliedEffectDTO' } }
    }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  try {
    const appliedeffects = await getAppliedEffects();
    res.status(StatusCodes.OK).json(appliedeffects);
  } catch (err) {
    handleError(res, err, "Error retrieving appliedeffects");
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Update a appliedeffect'
    #swagger.description = 'Endpoint to update an existing appliedeffect.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the appliedeffect to update',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/UpdateAppliedEffectDTO' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'AppliedEffect updated successfully.',
      schema: { $ref: '#/definitions/AppliedEffectDTO' }
    }
    #swagger.responses[404] = { description: 'AppliedEffect not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedAppliedEffect = await updateAppliedEffect(id, updateData);
    res.status(StatusCodes.OK).json(updatedAppliedEffect);
  } catch (err) {
    handleError(res, err, "Error updating appliedeffect");
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Delete a appliedeffect'
    #swagger.description = 'Endpoint to delete a appliedeffect.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the appliedeffect to delete',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'AppliedEffect deleted successfully.',
      schema: { $ref: '#/definitions/AppliedEffectDTO' }
    }
    #swagger.responses[404] = { description: 'AppliedEffect not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const deletedAppliedEffect = await deleteAppliedEffect(id);
    res.status(StatusCodes.OK).json(deletedAppliedEffect);
  } catch (err) {
    handleError(res, err, "Error deleting appliedeffect");
  }
};

export default { create, getById, getAll, update, remove };
