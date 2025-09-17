import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { CreateCharacterDTO, DeleteCharacterDTO, UpdateCharacterDTO, CharacterDTO } from './character.types';
import * as characterServices from './character.services';

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create a new character'
    #swagger.description = 'Endpoint to create a new character.'

    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/CreateCharacterDTO' }
        }
      }
    }

    #swagger.responses[201] = {
      description: 'Character created successfully.',
      schema: { $ref: '#/definitions/CharacterDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity (validation failed)' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const characterData: CreateCharacterDTO = req.body;

  try {
    const newCharacter: CharacterDTO = await characterServices.createCharacter(characterData);
    res.status(StatusCodes.CREATED).json(newCharacter);
  } catch (err) {
    console.error("Error creating character:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
    /*
      #swagger.summary = 'Get character by ID'
      #swagger.description = 'Endpoint to retrieve a character by their ID.'

      #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the character to retrieve',
        required: true,
        type: 'string'
      }

      #swagger.responses[200] = {
        description: 'Character retrieved successfully.',
        schema: { $ref: '#/definitions/CharacterDTO' }
      }
      #swagger.responses[404] = { description: 'Character not found' }
      #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    const { id } = req.params;

    try {
        const character: CharacterDTO | null = await characterServices.getCharacterById(id);

        if (!character) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: "Character not found",
            });
            return;
        }

        res.status(StatusCodes.OK).json(character);
    } catch (err) {
        console.error("Error retrieving character:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

const getUserCharacters = async (req: Request, res: Response): Promise<void> => {
    /*
      #swagger.summary = 'Get characters by user ID'
      #swagger.description = 'Endpoint to retrieve all characters for a specific user.'

      #swagger.parameters['userId'] = {
        in: 'path',
        description: 'ID of the user whose characters to retrieve',
        required: true,
        type: 'string'
      }

      #swagger.responses[200] = {
        description: 'Characters retrieved successfully.',
        schema: { type: 'array', items: { $ref: '#/definitions/CharacterDTO' } }
      }
      #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    const { userId } = req.params;

    try {
        const characters: CharacterDTO[] = await characterServices.getUserCharacters(userId);
        res.status(StatusCodes.OK).json(characters);
    } catch (err) {
        console.error("Error retrieving characters:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

const getAll = async (req: Request, res: Response): Promise<void> => {
    /*
      #swagger.summary = 'Get all characters'
      #swagger.description = 'Endpoint to retrieve all characters.'

      #swagger.responses[200] = {
        description: 'Characters retrieved successfully.',
        schema: { type: 'array', items: { $ref: '#/definitions/CharacterDTO' } }
      }
      #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    try {
        const characters: CharacterDTO[] = await characterServices.getCharacters();
        res.status(StatusCodes.OK).json(characters);
    } catch (err) {
        console.error("Error retrieving characters:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

const update = async (req: Request, res: Response): Promise<void> => {
    /*
      #swagger.summary = 'Update a character'
      #swagger.description = 'Endpoint to update an existing character.'

      #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the character to update',
        required: true,
        type: 'string'
      }

      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/UpdateCharacterDTO' }
          }
        }
      }

      #swagger.responses[200] = {
        description: 'Character updated successfully.',
        schema: { $ref: '#/definitions/CharacterDTO' }  
    }
      #swagger.responses[400] = { description: 'Bad Request' }
      #swagger.responses[404] = { description: 'Character not found' }
      #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    const { id } = req.params;
    const characterData: UpdateCharacterDTO = req.body;

    try {
        const existingCharacter: CharacterDTO | null = await characterServices.getCharacterById(id);

        if (!existingCharacter) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: "Character not found",
            });
            return;
        }

        const updatedCharacter: CharacterDTO = await characterServices.updateCharacter(id, characterData);
        res.status(StatusCodes.OK).json(updatedCharacter);
    } catch (err) {
        console.error("Error updating character:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
}

const remove = async (req: Request, res: Response): Promise<void> => {
    /*
      #swagger.summary = 'Delete a character'
      #swagger.description = 'Endpoint to delete a character by their ID.'

      #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the character to delete',
        required: true,
        type: 'string'
      }

      #swagger.responses[200] = {
        description: 'Character deleted successfully.',
        schema: { $ref: '#/definitions/CharacterDTO' }
      }
      #swagger.responses[404] = { description: 'Character not found' }
      #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    const { id } = req.params;

    try {
        const existingCharacter: CharacterDTO | null = await characterServices.getCharacterById(id);

        if (!existingCharacter) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: "Character not found",
            });
            return;
        }

        const deletedCharacter: CharacterDTO = await characterServices.deleteCharacter(id);
        res.status(StatusCodes.OK).json(deletedCharacter);
    } catch (err) {
        console.error("Error deleting character:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
}

export default{
    create,
    getById,
    getUserCharacters,
    getAll,
    update,
    remove,
};