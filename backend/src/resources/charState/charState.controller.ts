import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { CreateCharacterStateDTO, UpdateCharacterStateDTO, DeleteCharacterStateDTO, CharacterStateDTO } from './charState.types';
import { createCharacterState, getCharacterStateById, getCharacterStateByCharacterId, updateCharacterState, systemUpdateCharacterState, deleteCharacterState } from './charState.services';

const prisma = new PrismaClient();

const create = async (req: Request, res: Response): Promise<Response> => {
    /* 
    #swagger.summary = 'Create character state'
    #swagger.description = 'Endpoint to create a character state.'

    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: '#/definitions/CreateCharStateDTO' }
            }
        }
    }

    #swagger.responses[201] = {
        description: 'Character state created successfully.',
        schema: { $ref: '#/definitions/CharStateDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity (validation failed)' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    try {
        const data: CreateCharacterStateDTO = req.body;
        const newState: CharacterStateDTO = await createCharacterState(data);
        return res.status(StatusCodes.CREATED).json(newState);
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: (error as Error).message });
    }
};

const getById = async (req: Request, res: Response): Promise<Response> => {
    /*
    #swagger.summary = 'Get character state by ID'
    #swagger.description = 'Endpoint to retrieve a character state by its ID.'

    #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the character state to retrieve',
        required: true,
        type: 'string'
    }

    #swagger.responses[200] = {
        description: 'Character state retrieved successfully.',
        schema: { $ref: '#/definitions/CharStateDTO' }
    }
    #swagger.responses[404] = { description: 'Character state not found' }
    */

    const { id } = req.params;

    try {
        const state: CharacterStateDTO | null = await getCharacterStateById(id);
        if (!state) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Character state not found' });
        }
        return res.status(StatusCodes.OK).json(state);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
};

const getByCharacterId = async (req: Request, res: Response): Promise<Response> => {
    /*
    #swagger.summary = 'Get character state by Character ID'
    #swagger.description = 'Endpoint to retrieve a character state by the associated Character ID.'

    #swagger.parameters['characterId'] = {
        in: 'path',
        description: 'ID of the character whose state to retrieve',
        required: true,
        type: 'string'
    }

    #swagger.responses[200] = {
        description: 'Character state retrieved successfully.',
        schema: { $ref: '#/definitions/CharStateDTO' }
    }
    #swagger.responses[404] = { description: 'Character state not found' }
    */

    const { characterId } = req.params;

    try {
        const state: CharacterStateDTO | null = await getCharacterStateByCharacterId(characterId);
        if (!state) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Character state not found' });
        }
        return res.status(StatusCodes.OK).json(state);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
};

const update = async (req: Request, res: Response): Promise<Response> => {
    /*
    #swagger.summary = 'Update character state'
    #swagger.description = 'Endpoint to update a character state by its ID.'

    #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the character state to update',
        required: true,
        type: 'string'
    }

    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: '#/definitions/UpdateCharStateDTO' }
            }
        }
    }

    #swagger.responses[200] = {
        description: 'Character state updated successfully.',
        schema: { $ref: '#/definitions/CharStateDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[404] = { description: 'Character state not found' }
    #swagger.responses[422] = { description: 'Unprocessable Entity (validation failed)' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    const { id } = req.params;
    const data: UpdateCharacterStateDTO = req.body;

    try {
        const updatedState: CharacterStateDTO = await updateCharacterState(id, data);
        return res.status(StatusCodes.OK).json(updatedState);
    } catch (error) {
        if ((error as any).code === 'P2025') { // Prisma not found error code
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Character state not found' });
        }
        return res.status(StatusCodes.BAD_REQUEST).json({ error: (error as Error).message });
    }
};

const systemUpdate = async (req: Request, res: Response): Promise<Response> => {
    /*
    #swagger.summary = 'System update character state by Character id'
    #swagger.description = 'Endpoint for system to update a character state based on character stats.'
    
    #swagger.parameters['characterId'] = {
        in: 'path',
        description: 'ID of the character whose state to update',
        required: true,
        type: 'string'
    }

    #swagger.responses[200] = {
        description: 'Character state updated successfully.',
        schema: { $ref: '#/definitions/CharStateDTO' }
    }

    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[404] = { description: 'Character or character state not found' }
    #swagger.responses[422] = { description: 'Unprocessable Entity (validation failed)' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    const { characterId } = req.params;

    try {
        const updatedState: CharacterStateDTO | null = await systemUpdateCharacterState(characterId);
        if (!updatedState) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Character or character state not found' });
        }
        return res.status(StatusCodes.OK).json(updatedState);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
};

const remove = async (req: Request, res: Response): Promise<Response> => {
    /*
    #swagger.summary = 'Delete character state'
    #swagger.description = 'Endpoint to delete a character state by its ID.'

    #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the character state to delete',
        required: true,
        type: 'string'
    }  
    #swagger.responses[200] = {
        description: 'Character state deleted successfully.',
        schema: { $ref: '#/definitions/CharStateDTO' }
    }
    #swagger.responses[404] = { description: 'Character state not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    const { id } = req.params;

    try {
        const deletedState: CharacterStateDTO = await deleteCharacterState(id);
        return res.status(StatusCodes.OK).json(deletedState);
    } catch (error) {
        if ((error as any).code === 'P2025') { // Prisma not found error code
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Character state not found' });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
};

export default { create, getById, getByCharacterId, update, systemUpdate, remove };
