import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { CreateInventoryDTO, UpdateInventoryDTO, DeleteInventoryDTO, InventoryDTO } from './inventory.types';
import { createInventoryItem, getInventoryByCharacterId, updateInventoryItem, deleteInventoryItem } from './inventory.services';

const prisma = new PrismaClient();

const create = async (req: Request, res: Response): Promise<Response> => {
    /* 
    #swagger.summary = 'Create inventory item'
    #swagger.description = 'Endpoint to create an inventory item for a character.'

    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: '#/definitions/CreateInventoryDTO' }
            }
        }
    }

    #swagger.responses[201] = {
        description: 'Inventory item created successfully.',
        schema: { $ref: '#/definitions/InventoryDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity (validation failed)' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    try {
        const data: CreateInventoryDTO = req.body;
        const newItem: InventoryDTO = await createInventoryItem(data);
        return res.status(StatusCodes.CREATED).json(newItem);
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: (error as Error).message });
    }
};

const getByCharacterId = async (req: Request, res: Response): Promise<Response> => {
    /*
    #swagger.summary = 'Get inventory items by character ID'
    #swagger.description = 'Endpoint to retrieve all inventory items for a specific character by their ID.'

    #swagger.parameters['characterId'] = {
        in: 'path',
        description: 'ID of the character whose inventory items to retrieve',
        required: true,
        type: 'string'
    }

    #swagger.responses[200] = {
        description: 'Inventory items retrieved successfully.',
        schema: { type: 'array', items: { $ref: '#/definitions/InventoryDTO' } }
    }
    #swagger.responses[404] = { description: 'Character not found' }
    */

    try {
        const { characterId } = req.params;
        const items: InventoryDTO[] = await getInventoryByCharacterId(characterId);
        return res.status(StatusCodes.OK).json(items);
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: (error as Error).message });
    }
};

const update = async (req: Request, res: Response): Promise<Response> => {
    /*
    #swagger.summary = 'Update inventory item'
    #swagger.description = 'Endpoint to update an existing inventory item.'

    #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the inventory item to update',
        required: true,
        type: 'string'
    }

    #swagger.requestBody = {
        required: true, 
        content: {
            "application/json": {
                schema: { $ref: '#/definitions/UpdateInventoryDTO' }
            }
        }
    }
    #swagger.responses[200] = {
        description: 'Inventory item updated successfully.',
        schema: { $ref: '#/definitions/InventoryDTO' }
    }
    #swagger.responses[404] = { description: 'Inventory item not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    try {
        const { id } = req.params;
        const data: UpdateInventoryDTO = req.body;
        const updatedItem: InventoryDTO | null = await updateInventoryItem(id, data);
        if (!updatedItem) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Inventory item not found' });
        }
        return res.status(StatusCodes.OK).json(updatedItem);
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: (error as Error).message });
    }
};

const remove = async (req: Request, res: Response): Promise<Response> => {
    /*
    #swagger.summary = 'Delete inventory item'
    #swagger.description = 'Endpoint to delete an inventory item.'

    #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the inventory item to delete',
        required: true,
        type: 'string'
    }

    #swagger.responses[204] = {
        description: 'Inventory item deleted successfully.'
    }
    #swagger.responses[404] = { description: 'Inventory item not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    try {
        const { id } = req.params;
        await deleteInventoryItem(id);
        return res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: (error as Error).message });
    }
};

export { create, getByCharacterId, update, remove };    