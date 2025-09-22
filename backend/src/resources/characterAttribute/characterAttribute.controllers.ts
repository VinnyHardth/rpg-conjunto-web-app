import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { createCharacterAttribute,
         getCharacterAttributeById,
         getCharacterAttributes,
         getCharacterAttributesByCharacterId,
         updateCharacterAttribute,
         deleteCharacterAttribute
        } from './characterAttribute.services';

const handleError = (res: Response, err: any, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
};

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create a new characterattribute'
    #swagger.description = 'Endpoint to create a new characterattribute.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/CreateCharacterAttributeDTO' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'CharacterAttribute created successfully.',
      schema: { $ref: '#/definitions/CharacterAttributeDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const characterattributeData = req.body;

  try {
    const newCharacterAttribute = await createCharacterAttribute(characterattributeData);
    res.status(StatusCodes.CREATED).json(newCharacterAttribute);
  } catch (err) {
    handleError(res, err, 'Error creating characterattribute');
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get characterattribute by ID'
    #swagger.description = 'Endpoint to retrieve a characterattribute by ID.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the characterattribute to retrieve',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'CharacterAttribute retrieved successfully.',
      schema: { $ref: '#/definitions/CharacterAttributeDTO' }
    }
    #swagger.responses[404] = { description: 'CharacterAttribute not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const characterattribute = await getCharacterAttributeById(id);
    if (!characterattribute) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'CharacterAttribute not found' });
      return;
    }
    res.status(StatusCodes.OK).json(characterattribute);
  } catch (err) {
    handleError(res, err, 'Error retrieving characterattribute');
  }
};

const getByCharacterId = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get characterattributes by character ID'
    #swagger.description = 'Endpoint to retrieve characterattributes by character ID.'
    #swagger.parameters['characterId'] = {
      in: 'path',
      description: 'ID of the character to retrieve characterattributes for',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'CharacterAttributes retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/CharacterAttributeDTO' } }
    }
    #swagger.responses[404] = { description: 'Character not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { characterId } = req.params;

  try {
    const characterattributes = await getCharacterAttributesByCharacterId(characterId);
    res.status(StatusCodes.OK).json(characterattributes);
  } catch (err) {
    handleError(res, err, 'Error retrieving characterattributes');
  }
};

const getAll = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get all characterattributes'
    #swagger.description = 'Endpoint to retrieve all characterattributes.'
    #swagger.responses[200] = {
      description: 'CharacterAttributes retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/CharacterAttributeDTO' } }
    }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  try {
    const characterattributes = await getCharacterAttributes();
    res.status(StatusCodes.OK).json(characterattributes);
  } catch (err) {
    handleError(res, err, 'Error retrieving characterattributes');
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Update a characterattribute'
    #swagger.description = 'Endpoint to update an existing characterattribute.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the characterattribute to update',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/UpdateCharacterAttributeDTO' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'CharacterAttribute updated successfully.',
      schema: { $ref: '#/definitions/CharacterAttributeDTO' }
    }
    #swagger.responses[404] = { description: 'CharacterAttribute not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedCharacterAttribute = await updateCharacterAttribute(id, updateData);
    res.status(StatusCodes.OK).json(updatedCharacterAttribute);
  } catch (err) {
    handleError(res, err, 'Error updating characterattribute');
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Delete a characterattribute'
    #swagger.description = 'Endpoint to delete a characterattribute.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the characterattribute to delete',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'CharacterAttribute deleted successfully.',
      schema: { $ref: '#/definitions/CharacterAttributeDTO' }
    }
    #swagger.responses[404] = { description: 'CharacterAttribute not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const deletedCharacterAttribute = await deleteCharacterAttribute(id);
    res.status(StatusCodes.OK).json(deletedCharacterAttribute);
  } catch (err) {
    handleError(res, err, 'Error deleting characterattribute');
  }
};

export default { create, getById, getByCharacterId, getAll, update, remove };
