import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import  { CreateItemBonusDTO, UpdateItemBonusDTO, DeleteItemBonusDTO, ItemBonusDTO } from './itemBonus.types';
import { createItemBonus, getItemBonus, getItemBonusByItemId, updateItemBonus, deleteItemBonus } from './itemBonus.services';

const prisma = new PrismaClient();

const create = async (req: Request, res: Response): Promise<Response> => {
    /* 
    #swagger.summary = 'Create item bonus'
    #swagger.description = 'Endpoint to create an item bonus for a specific item.'

    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: '#/definitions/CreateItemBonusDTO' }
            }
        }
    }

    #swagger.responses[201] = {
        description: 'Item bonus created successfully.',
        schema: { $ref: '#/definitions/ItemBonusDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity (validation failed)' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    try {
        const data: CreateItemBonusDTO = req.body;
        const newItemBonus: ItemBonusDTO = await createItemBonus(data);
        return res.status(StatusCodes.CREATED).json(newItemBonus);
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: (error as Error).message });
    }
}

const getById = async (req: Request, res: Response): Promise<Response> => {
    /*
    #swagger.summary = 'Get item bonus by ID'
    #swagger.description = 'Endpoint to retrieve an item bonus by its ID.'

    #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the item bonus to retrieve',
        required: true,
        type: 'string'
    }

    #swagger.responses[200] = {
        description: 'Item bonus retrieved successfully.',
        schema: { $ref: '#/definitions/ItemBonusDTO' }
    }
    #swagger.responses[404] = { description: 'Item bonus not found' }
    */

    try {
        const { id } = req.params;
        const itemBonus: ItemBonusDTO | null = await getItemBonus(id);
        if (!itemBonus) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: ReasonPhrases.NOT_FOUND });
        }
        return res.status(StatusCodes.OK).json(itemBonus);
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: (error as Error).message });
    }
}

const getByItemId = async (req: Request, res: Response): Promise<Response> => {
    /*
    #swagger.summary = 'Get item bonuses by item ID'
    #swagger.description = 'Endpoint to retrieve all item bonuses for a specific item by its ID.'

    #swagger.parameters['itemId'] = {
        in: 'path',
        description: 'ID of the item whose bonuses to retrieve',
        required: true,
        type: 'string'
    }

    #swagger.responses[200] = {
        description: 'Item bonuses retrieved successfully.',
        schema: { type: 'array', items: { $ref: '#/definitions/ItemBonusDTO' } }
    }
    #swagger.responses[404] = { description: 'Item not found' }
    */

    try {
        const { itemId } = req.params;
        const itemBonuses: ItemBonusDTO[] = await getItemBonusByItemId(itemId);
        return res.status(StatusCodes.OK).json(itemBonuses);
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: (error as Error).message });
    }
}

const update = async (req: Request, res: Response): Promise<Response> => {
    /*
    #swagger.summary = 'Update item bonus'
    #swagger.description = 'Endpoint to update an existing item bonus.'

    #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the item bonus to update',
        required: true,
        type: 'string'
    }

    #swagger.requestBody = {
        required: true, 
        content: {
            "application/json": {
                schema: { $ref: '#/definitions/UpdateItemBonusDTO' }
            }
        }
    }
    #swagger.responses[200] = {
        description: 'Item bonus updated successfully.',
        schema: { $ref: '#/definitions/ItemBonusDTO' }
    }
    #swagger.responses[404] = { description: 'Item bonus not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    try {
        const { id } = req.params;
        const data: UpdateItemBonusDTO = req.body;
        const updatedItemBonus: ItemBonusDTO | null = await updateItemBonus(id, data);
        if (!updatedItemBonus) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: ReasonPhrases.NOT_FOUND });
        }
        return res.status(StatusCodes.OK).json(updatedItemBonus);
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: (error as Error).message });
    }
}

const remove = async (req: Request, res: Response): Promise<Response> => {
    /*
    #swagger.summary = 'Delete item bonus'
    #swagger.description = 'Endpoint to delete an item bonus by its ID.'

    #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the item bonus to delete',
        required: true,
        type: 'string'
    }

    #swagger.responses[200] = {
        description: 'Item bonus deleted successfully.',
        schema: { $ref: '#/definitions/ItemBonusDTO' }
    }
    #swagger.responses[404] = { description: 'Item bonus not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    try {
        const { id } = req.params;
        const deletedItemBonus: ItemBonusDTO | null = await deleteItemBonus(id);
        if (!deletedItemBonus) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: ReasonPhrases.NOT_FOUND });
        }
        return res.status(StatusCodes.OK).json(deletedItemBonus);
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: (error as Error).message });
    }
}

export {
    create,
    getById,
    getByItemId,
    update,
    remove
};