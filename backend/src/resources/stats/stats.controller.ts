import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { createStatsDTO, updateStatsDTO, deleteStatsDTO, StatsDTO } from './stats.types'; 
import * as statsServices from './stats.services';

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create stats for a character'
    #swagger.description = 'Endpoint to create stats for a character.'

    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/CreateStatsDTO' }
        }
      }
    }

    #swagger.responses[201] = {
      description: 'Stats created successfully.',
      schema: { $ref: '#/definitions/StatsDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity (validation failed)' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const statsData: createStatsDTO = req.body;

  try {
    const newStats: StatsDTO = await statsServices.createStats(statsData);
    res.status(StatusCodes.CREATED).json(newStats);
  } catch (err) {
    console.error("Error creating stats:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
    /*
      #swagger.summary = 'Get stats by ID'
      #swagger.description = 'Endpoint to retrieve stats by their ID.'

      #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the stats to retrieve',
        required: true,
        type: 'string'
      }

      #swagger.responses[200] = {
        description: 'Stats retrieved successfully.',
        schema: { $ref: '#/definitions/StatsDTO' }
      }
      #swagger.responses[404] = { description: 'Stats not found' }
      #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    const { id } = req.params;

    try {
        const stats: StatsDTO | null = await statsServices.getStatsById(id);
        if (!stats) {
            res.status(StatusCodes.NOT_FOUND).json({ message: 'Stats not found' });
            return;
        }
        res.status(StatusCodes.OK).json(stats);
    } catch (err) {
        console.error("Error retrieving stats:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

const getByCharacterId = async (req: Request, res: Response): Promise<void> => {
    /*
      #swagger.summary = 'Get stats by Character ID'
      #swagger.description = 'Endpoint to retrieve stats by their associated Character ID.'

      #swagger.parameters['characterId'] = {
        in: 'path',
        description: 'ID of the character whose stats to retrieve',
        required: true,
        type: 'string'
      }

      #swagger.responses[200] = {
        description: 'Stats retrieved successfully.',
        schema: { $ref: '#/definitions/StatsDTO' }
      }
      #swagger.responses[404] = { description: 'Stats not found' }
      #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    const { characterId } = req.params;

    try {
        const stats: StatsDTO | null = await statsServices.getCharacterStats(characterId);
        if (!stats) {
            res.status(StatusCodes.NOT_FOUND).json({ message: 'Stats not found for this character' });
            return;
        }
        res.status(StatusCodes.OK).json(stats);
    } catch (err) {
        console.error("Error retrieving stats:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Update stats by ID'
    #swagger.description = 'Endpoint to update stats by their ID.'

    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the stats to update',
      required: true,
      type: 'string'
    }

    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/UpdateStatsDTO' }
        }
      }
    }

    #swagger.responses[200] = {
      description: 'Stats updated successfully.',
      schema: { $ref: '#/definitions/StatsDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[404] = { description: 'Stats not found' }
    #swagger.responses[422] = { description: 'Unprocessable Entity (validation failed)' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;
  const statsData: updateStatsDTO = req.body;

  try {
    const updatedStats: StatsDTO = await statsServices.updateStats(id, statsData);
    res.status(StatusCodes.OK).json(updatedStats);
  } catch (err) {
    console.error("Error updating stats:", err);
    if (err instanceof Error && err.message.includes("Record to update not found.")) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Stats not found' });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      });
    }
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Delete stats by ID'
    #swagger.description = 'Endpoint to delete stats by their ID.'

    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the stats to delete',
      required: true,
      type: 'string'
    }

    #swagger.responses[200] = {
      description: 'Stats deleted successfully.',
      schema: { $ref: '#/definitions/StatsDTO' }
    }
    #swagger.responses[404] = { description: 'Stats not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const deletedStats: StatsDTO = await statsServices.deleteStats(id);
    res.status(StatusCodes.OK).json(deletedStats);
  } catch (err) {
    console.error("Error deleting stats:", err);
    if (err instanceof Error && err.message.includes("Record to update not found.")) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Stats not found' });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      });
    }
  }
};

export default { create, getById, getByCharacterId, update, remove };