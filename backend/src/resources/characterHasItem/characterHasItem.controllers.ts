import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import {
  createCharacterHasItem,
  getCharacterHasItemsByCharacterId,
  getCharacterHasItemById,
  getCharacterHasItems,
  updateCharacterHasItem,
  deleteCharacterHasItem,
} from "./characterHasItem.services";

const handleError = (res: Response, err: any, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
};

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create a new characterhasitem'
    #swagger.description = 'Endpoint to create a new characterhasitem.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/CreateCharacterHasItemDTO' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'CharacterHasItem created successfully.',
      schema: { $ref: '#/definitions/CharacterHasItemDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const characterhasitemData = req.body;

  try {
    const newCharacterHasItem =
      await createCharacterHasItem(characterhasitemData);
    res.status(StatusCodes.CREATED).json(newCharacterHasItem);
  } catch (err) {
    handleError(res, err, "Error creating characterhasitem");
  }
};

const getByCharacterId = async (
  req: Request,
  res: Response
): Promise<void> => {
  /*
    #swagger.summary = 'Get all characterhasitems by character ID'
    #swagger.description = 'Endpoint to retrieve all characterhasitems by character ID.'
    #swagger.parameters['characterId'] = {
      in: 'path',
      description: 'ID of the character to retrieve characterhasitems for',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'CharacterHasItems retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/CharacterHasItemDTO' } }
    }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { characterId } = req.params;

  try {
    const characterhasitems =
      await getCharacterHasItemsByCharacterId(characterId);
    res.status(StatusCodes.OK).json(characterhasitems);
  } catch (err) {
    handleError(res, err, "Error retrieving characterhasitems");
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get characterhasitem by ID'
    #swagger.description = 'Endpoint to retrieve a characterhasitem by ID.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the characterhasitem to retrieve',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'CharacterHasItem retrieved successfully.',
      schema: { $ref: '#/definitions/CharacterHasItemDTO' }
    }
    #swagger.responses[404] = { description: 'CharacterHasItem not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const characterhasitem = await getCharacterHasItemById(id);
    if (!characterhasitem) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "CharacterHasItem not found" });
      return;
    }
    res.status(StatusCodes.OK).json(characterhasitem);
  } catch (err) {
    handleError(res, err, "Error retrieving characterhasitem");
  }
};

const getAll = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get all characterhasitems'
    #swagger.description = 'Endpoint to retrieve all characterhasitems.'
    #swagger.responses[200] = {
      description: 'CharacterHasItems retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/CharacterHasItemDTO' } }
    }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  try {
    const characterhasitems = await getCharacterHasItems();
    res.status(StatusCodes.OK).json(characterhasitems);
  } catch (err) {
    handleError(res, err, "Error retrieving characterhasitems");
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Update a characterhasitem'
    #swagger.description = 'Endpoint to update an existing characterhasitem.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the characterhasitem to update',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/UpdateCharacterHasItemDTO' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'CharacterHasItem updated successfully.',
      schema: { $ref: '#/definitions/CharacterHasItemDTO' }
    }
    #swagger.responses[404] = { description: 'CharacterHasItem not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedCharacterHasItem = await updateCharacterHasItem(
      id,
      updateData,
    );
    res.status(StatusCodes.OK).json(updatedCharacterHasItem);
  } catch (err) {
    handleError(res, err, "Error updating characterhasitem");
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Delete a characterhasitem'
    #swagger.description = 'Endpoint to delete a characterhasitem.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the characterhasitem to delete',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'CharacterHasItem deleted successfully.',
      schema: { $ref: '#/definitions/CharacterHasItemDTO' }
    }
    #swagger.responses[404] = { description: 'CharacterHasItem not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const deletedCharacterHasItem = await deleteCharacterHasItem(id);
    res.status(StatusCodes.OK).json(deletedCharacterHasItem);
  } catch (err) {
    handleError(res, err, "Error deleting characterhasitem");
  }
};

export default { create, getByCharacterId, getById, getAll, update, remove };
