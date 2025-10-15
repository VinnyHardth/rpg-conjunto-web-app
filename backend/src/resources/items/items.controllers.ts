import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import {
  createItems,
  getItemsById,
  getItemss,
  updateItems,
  deleteItems
} from "./items.services";

const handleError = (res: Response, err: any, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR
  });
};

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create a new items'
    #swagger.description = 'Endpoint to create a new items.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/CreateItemsDTO' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Items created successfully.',
      schema: { $ref: '#/definitions/ItemsDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const itemsData = req.body;

  try {
    const newItems = await createItems(itemsData);
    res.status(StatusCodes.CREATED).json(newItems);
  } catch (err) {
    handleError(res, err, "Error creating items");
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get items by ID'
    #swagger.description = 'Endpoint to retrieve a items by ID.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the items to retrieve',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Items retrieved successfully.',
      schema: { $ref: '#/definitions/ItemsDTO' }
    }
    #swagger.responses[404] = { description: 'Items not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const items = await getItemsById(id);
    if (!items) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Items not found" });
      return;
    }
    res.status(StatusCodes.OK).json(items);
  } catch (err) {
    handleError(res, err, "Error retrieving items");
  }
};

const getAll = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get all itemss'
    #swagger.description = 'Endpoint to retrieve all itemss.'
    #swagger.responses[200] = {
      description: 'Itemss retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/ItemsDTO' } }
    }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  try {
    const itemss = await getItemss();
    res.status(StatusCodes.OK).json(itemss);
  } catch (err) {
    handleError(res, err, "Error retrieving itemss");
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Update a items'
    #swagger.description = 'Endpoint to update an existing items.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the items to update',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/UpdateItemsDTO' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'Items updated successfully.',
      schema: { $ref: '#/definitions/ItemsDTO' }
    }
    #swagger.responses[404] = { description: 'Items not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedItems = await updateItems(id, updateData);
    res.status(StatusCodes.OK).json(updatedItems);
  } catch (err) {
    handleError(res, err, "Error updating items");
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Delete a items'
    #swagger.description = 'Endpoint to delete a items.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the items to delete',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Items deleted successfully.',
      schema: { $ref: '#/definitions/ItemsDTO' }
    }
    #swagger.responses[404] = { description: 'Items not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const deletedItems = await deleteItems(id);
    res.status(StatusCodes.OK).json(deletedItems);
  } catch (err) {
    handleError(res, err, "Error deleting items");
  }
};

export default { create, getById, getAll, update, remove };
