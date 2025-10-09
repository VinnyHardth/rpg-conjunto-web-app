import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import {
  createItemHasEffect,
  getItemHasEffectById,
  getItemHasEffects,
  updateItemHasEffect,
  deleteItemHasEffect,
} from "./itemHasEffect.services";

const handleError = (res: Response, err: any, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
};

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create a new itemhaseffect'
    #swagger.description = 'Endpoint to create a new itemhaseffect.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/CreateItemHasEffectDTO' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'ItemHasEffect created successfully.',
      schema: { $ref: '#/definitions/ItemHasEffectDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const itemhaseffectData = req.body;

  try {
    const newItemHasEffect = await createItemHasEffect(itemhaseffectData);
    res.status(StatusCodes.CREATED).json(newItemHasEffect);
  } catch (err) {
    handleError(res, err, "Error creating itemhaseffect");
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get itemhaseffect by ID'
    #swagger.description = 'Endpoint to retrieve a itemhaseffect by ID.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the itemhaseffect to retrieve',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'ItemHasEffect retrieved successfully.',
      schema: { $ref: '#/definitions/ItemHasEffectDTO' }
    }
    #swagger.responses[404] = { description: 'ItemHasEffect not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const itemhaseffect = await getItemHasEffectById(id);
    if (!itemhaseffect) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "ItemHasEffect not found" });
      return;
    }
    res.status(StatusCodes.OK).json(itemhaseffect);
  } catch (err) {
    handleError(res, err, "Error retrieving itemhaseffect");
  }
};

const getAll = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get all itemhaseffects'
    #swagger.description = 'Endpoint to retrieve all itemhaseffects.'
    #swagger.responses[200] = {
      description: 'ItemHasEffects retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/ItemHasEffectDTO' } }
    }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  try {
    const itemhaseffects = await getItemHasEffects();
    res.status(StatusCodes.OK).json(itemhaseffects);
  } catch (err) {
    handleError(res, err, "Error retrieving itemhaseffects");
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Update a itemhaseffect'
    #swagger.description = 'Endpoint to update an existing itemhaseffect.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the itemhaseffect to update',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/UpdateItemHasEffectDTO' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'ItemHasEffect updated successfully.',
      schema: { $ref: '#/definitions/ItemHasEffectDTO' }
    }
    #swagger.responses[404] = { description: 'ItemHasEffect not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedItemHasEffect = await updateItemHasEffect(id, updateData);
    res.status(StatusCodes.OK).json(updatedItemHasEffect);
  } catch (err) {
    handleError(res, err, "Error updating itemhaseffect");
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Delete a itemhaseffect'
    #swagger.description = 'Endpoint to delete a itemhaseffect.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the itemhaseffect to delete',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'ItemHasEffect deleted successfully.',
      schema: { $ref: '#/definitions/ItemHasEffectDTO' }
    }
    #swagger.responses[404] = { description: 'ItemHasEffect not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const deletedItemHasEffect = await deleteItemHasEffect(id);
    res.status(StatusCodes.OK).json(deletedItemHasEffect);
  } catch (err) {
    handleError(res, err, "Error deleting itemhaseffect");
  }
};

export default { create, getById, getAll, update, remove };
