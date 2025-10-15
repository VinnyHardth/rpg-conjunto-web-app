import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import {
  createAbilityEffect,
  getAbilityEffectById,
  getAbilityEffects,
  updateAbilityEffect,
  deleteAbilityEffect
} from "./abilityEffect.services";

const handleError = (res: Response, err: any, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR
  });
};

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create a new abilityeffect'
    #swagger.description = 'Endpoint to create a new abilityeffect.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/CreateAbilityEffectDTO' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'AbilityEffect created successfully.',
      schema: { $ref: '#/definitions/AbilityEffectDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const abilityeffectData = req.body;

  try {
    const newAbilityEffect = await createAbilityEffect(abilityeffectData);
    res.status(StatusCodes.CREATED).json(newAbilityEffect);
  } catch (err) {
    handleError(res, err, "Error creating abilityeffect");
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get abilityeffect by ID'
    #swagger.description = 'Endpoint to retrieve a abilityeffect by ID.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the abilityeffect to retrieve',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'AbilityEffect retrieved successfully.',
      schema: { $ref: '#/definitions/AbilityEffectDTO' }
    }
    #swagger.responses[404] = { description: 'AbilityEffect not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const abilityeffect = await getAbilityEffectById(id);
    if (!abilityeffect) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "AbilityEffect not found" });
      return;
    }
    res.status(StatusCodes.OK).json(abilityeffect);
  } catch (err) {
    handleError(res, err, "Error retrieving abilityeffect");
  }
};

const getAll = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get all abilityeffects'
    #swagger.description = 'Endpoint to retrieve all abilityeffects.'
    #swagger.responses[200] = {
      description: 'AbilityEffects retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/AbilityEffectDTO' } }
    }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  try {
    const abilityeffects = await getAbilityEffects();
    res.status(StatusCodes.OK).json(abilityeffects);
  } catch (err) {
    handleError(res, err, "Error retrieving abilityeffects");
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Update a abilityeffect'
    #swagger.description = 'Endpoint to update an existing abilityeffect.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the abilityeffect to update',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/UpdateAbilityEffectDTO' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'AbilityEffect updated successfully.',
      schema: { $ref: '#/definitions/AbilityEffectDTO' }
    }
    #swagger.responses[404] = { description: 'AbilityEffect not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedAbilityEffect = await updateAbilityEffect(id, updateData);
    res.status(StatusCodes.OK).json(updatedAbilityEffect);
  } catch (err) {
    handleError(res, err, "Error updating abilityeffect");
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Delete a abilityeffect'
    #swagger.description = 'Endpoint to delete a abilityeffect.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the abilityeffect to delete',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'AbilityEffect deleted successfully.',
      schema: { $ref: '#/definitions/AbilityEffectDTO' }
    }
    #swagger.responses[404] = { description: 'AbilityEffect not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const deletedAbilityEffect = await deleteAbilityEffect(id);
    res.status(StatusCodes.OK).json(deletedAbilityEffect);
  } catch (err) {
    handleError(res, err, "Error deleting abilityeffect");
  }
};

export default { create, getById, getAll, update, remove };
