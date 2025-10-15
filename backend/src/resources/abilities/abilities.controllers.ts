import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import {
  createAbilities,
  getAbilitiesById,
  getAbilitiess,
  updateAbilities,
  deleteAbilities
} from "./abilities.services";

const handleError = (res: Response, err: any, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR
  });
};

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create a new abilities'
    #swagger.description = 'Endpoint to create a new abilities.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/CreateAbilitiesDTO' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Abilities created successfully.',
      schema: { $ref: '#/definitions/AbilitiesDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const abilitiesData = req.body;

  try {
    const newAbilities = await createAbilities(abilitiesData);
    res.status(StatusCodes.CREATED).json(newAbilities);
  } catch (err) {
    handleError(res, err, "Error creating abilities");
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get abilities by ID'
    #swagger.description = 'Endpoint to retrieve a abilities by ID.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the abilities to retrieve',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Abilities retrieved successfully.',
      schema: { $ref: '#/definitions/AbilitiesDTO' }
    }
    #swagger.responses[404] = { description: 'Abilities not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const abilities = await getAbilitiesById(id);
    if (!abilities) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Abilities not found" });
      return;
    }
    res.status(StatusCodes.OK).json(abilities);
  } catch (err) {
    handleError(res, err, "Error retrieving abilities");
  }
};

const getAll = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get all abilitiess'
    #swagger.description = 'Endpoint to retrieve all abilitiess.'
    #swagger.responses[200] = {
      description: 'Abilitiess retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/AbilitiesDTO' } }
    }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  try {
    const abilitiess = await getAbilitiess();
    res.status(StatusCodes.OK).json(abilitiess);
  } catch (err) {
    handleError(res, err, "Error retrieving abilitiess");
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Update a abilities'
    #swagger.description = 'Endpoint to update an existing abilities.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the abilities to update',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/UpdateAbilitiesDTO' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'Abilities updated successfully.',
      schema: { $ref: '#/definitions/AbilitiesDTO' }
    }
    #swagger.responses[404] = { description: 'Abilities not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedAbilities = await updateAbilities(id, updateData);
    res.status(StatusCodes.OK).json(updatedAbilities);
  } catch (err) {
    handleError(res, err, "Error updating abilities");
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Delete a abilities'
    #swagger.description = 'Endpoint to delete a abilities.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the abilities to delete',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Abilities deleted successfully.',
      schema: { $ref: '#/definitions/AbilitiesDTO' }
    }
    #swagger.responses[404] = { description: 'Abilities not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const deletedAbilities = await deleteAbilities(id);
    res.status(StatusCodes.OK).json(deletedAbilities);
  } catch (err) {
    handleError(res, err, "Error deleting abilities");
  }
};

export default { create, getById, getAll, update, remove };
