import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import {
  createItemSkills,
  getItemSkillsById,
  getItemSkillss,
  updateItemSkills,
  deleteItemSkills,
} from "./itemSkills.services";

const handleError = (res: Response, err: any, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
};

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create a new itemskills'
    #swagger.description = 'Endpoint to create a new itemskills.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/CreateItemSkillsDTO' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'ItemSkills created successfully.',
      schema: { $ref: '#/definitions/ItemSkillsDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const itemskillsData = req.body;

  try {
    const newItemSkills = await createItemSkills(itemskillsData);
    res.status(StatusCodes.CREATED).json(newItemSkills);
  } catch (err) {
    handleError(res, err, "Error creating itemskills");
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get itemskills by ID'
    #swagger.description = 'Endpoint to retrieve a itemskills by ID.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the itemskills to retrieve',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'ItemSkills retrieved successfully.',
      schema: { $ref: '#/definitions/ItemSkillsDTO' }
    }
    #swagger.responses[404] = { description: 'ItemSkills not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const itemskills = await getItemSkillsById(id);
    if (!itemskills) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "ItemSkills not found" });
      return;
    }
    res.status(StatusCodes.OK).json(itemskills);
  } catch (err) {
    handleError(res, err, "Error retrieving itemskills");
  }
};

const getAll = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get all itemskillss'
    #swagger.description = 'Endpoint to retrieve all itemskillss.'
    #swagger.responses[200] = {
      description: 'ItemSkillss retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/ItemSkillsDTO' } }
    }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  try {
    const itemskillss = await getItemSkillss();
    res.status(StatusCodes.OK).json(itemskillss);
  } catch (err) {
    handleError(res, err, "Error retrieving itemskillss");
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Update a itemskills'
    #swagger.description = 'Endpoint to update an existing itemskills.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the itemskills to update',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/UpdateItemSkillsDTO' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'ItemSkills updated successfully.',
      schema: { $ref: '#/definitions/ItemSkillsDTO' }
    }
    #swagger.responses[404] = { description: 'ItemSkills not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedItemSkills = await updateItemSkills(id, updateData);
    res.status(StatusCodes.OK).json(updatedItemSkills);
  } catch (err) {
    handleError(res, err, "Error updating itemskills");
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Delete a itemskills'
    #swagger.description = 'Endpoint to delete a itemskills.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the itemskills to delete',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'ItemSkills deleted successfully.',
      schema: { $ref: '#/definitions/ItemSkillsDTO' }
    }
    #swagger.responses[404] = { description: 'ItemSkills not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const deletedItemSkills = await deleteItemSkills(id);
    res.status(StatusCodes.OK).json(deletedItemSkills);
  } catch (err) {
    handleError(res, err, "Error deleting itemskills");
  }
};

export default { create, getById, getAll, update, remove };
