import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

import {
  FullCharacterData,
  CreateCharacterDTO,
  UpdateCharacterDTO,
  CharacterDTO
} from "./character.types";
import * as characterServices from "./character.services";

const handleError = (res: Response, err: any, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR
  });
};

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
    const newCharacter: CharacterDTO =
      await characterServices.createCharacter(characterData);
    res.status(StatusCodes.CREATED).json(newCharacter);
  } catch (err) {
    handleError(res, err, "Error creating character");
  }
};

const getFullCharacterData = async (
  req: Request,
  res: Response
): Promise<void> => {
  /*
    #swagger.summary = 'Get full character data by ID'
    #swagger.description = 'Endpoint to retrieve full character data by character ID.'

    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the character to retrieve full character data for',
      required: true,
      type: 'string'
    }

    #swagger.responses[200] = {
      description: 'Full character data retrieved successfully.',
      schema: { $ref: '#/definitions/FullCharacterData' }
    }
    #swagger.responses[404] = { description: 'Character not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const fullCharacterData: FullCharacterData =
      await characterServices.getFullCharacterData(id);
    res.status(StatusCodes.OK).json(fullCharacterData);
  } catch (err) {
    handleError(res, err, "Error retrieving full character data");
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
    const character: CharacterDTO | null =
      await characterServices.getCharacterById(id);

    if (!character) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "Character not found"
      });
      return;
    }
    res.status(StatusCodes.OK).json(character);
  } catch (err) {
    handleError(res, err, "Error retrieving character");
  }
};

const getUserCharacters = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    const characters: CharacterDTO[] =
      await characterServices.getUserCharacters(userId);
    res.status(StatusCodes.OK).json(characters);
  } catch (err) {
    handleError(res, err, "Error retrieving user characters");
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
    handleError(res, err, "Error retrieving characters");
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
    const updatedCharacter: CharacterDTO =
      await characterServices.updateCharacter(id, characterData);

    res.status(StatusCodes.OK).json(updatedCharacter);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Character not found" });
      return;
    }
    handleError(res, err, "Error updating character");
  }
};

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
    const deletedCharacter: CharacterDTO =
      await characterServices.deleteCharacter(id);

    res.status(StatusCodes.OK).json(deletedCharacter);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Character not found" });
      return;
    }
    handleError(res, err, "Error deleting character");
  }
};

const getByCampaignId = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get characters by campaign ID'
    #swagger.description = 'Endpoint to retrieve characters linked to a specific campaign.'
    #swagger.parameters['campaignId'] = {
      in: 'path',
      description: 'ID of the campaign to retrieve characters for',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Characters retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/CharacterDTO' } }
    }
  */

  const { campaignId } = req.params;

  try {
    const characters =
      await characterServices.getCharactersByCampaignId(campaignId);
    res.status(StatusCodes.OK).json(characters);
  } catch (err) {
    console.error("Error retrieving characters by campaign ID:", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

export default {
  create,
  getFullCharacterData,
  getById,
  getUserCharacters,
  getAll,
  update,
  remove,
  getByCampaignId
};
