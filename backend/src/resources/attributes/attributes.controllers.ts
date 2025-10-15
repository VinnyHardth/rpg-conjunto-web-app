import { Request, Response } from "express";
import { AttributeKind } from "@prisma/client";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

import {
  createAttributes,
  getAttributesById,
  getAttributes,
  getAttributesByKind,
  updateAttributes,
  deleteAttributes
} from "./attributes.services";

const handleError = (res: Response, err: any, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR
  });
};

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create a new attributes'
    #swagger.description = 'Endpoint to create a new attributes.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/CreateAttributesDTO' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Attributes created successfully.',
      schema: { $ref: '#/definitions/AttributesDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const attributesData = req.body;

  try {
    const newAttributes = await createAttributes(attributesData);
    res.status(StatusCodes.CREATED).json(newAttributes);
  } catch (err) {
    handleError(res, err, "Error creating attributes");
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get attributes by ID'
    #swagger.description = 'Endpoint to retrieve a attributes by ID.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the attributes to retrieve',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Attributes retrieved successfully.',
      schema: { $ref: '#/definitions/AttributesDTO' }
    }
    #swagger.responses[404] = { description: 'Attributes not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const attributes = await getAttributesById(id);
    if (!attributes) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Attributes not found" });
      return;
    }
    res.status(StatusCodes.OK).json(attributes);
  } catch (err) {
    handleError(res, err, "Error retrieving attributes");
  }
};

const getByKind = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get attributes by kind'
    #swagger.description = 'Endpoint to retrieve a attributes by kind.'
    #swagger.parameters['kind'] = {
      in: 'path',
      description: 'Kind of the attributes to retrieve',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Attributes retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/AttributesDTO' } }
    }
    #swagger.responses[404] = { description: 'Attributes not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { kind } = req.params;

  try {
    const attributes = await getAttributesByKind(kind as AttributeKind);
    if (!attributes) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Attributes not found" });
      return;
    }
    res.status(StatusCodes.OK).json(attributes);
  } catch (err) {
    handleError(res, err, "Error retrieving attributes");
  }
};

const getAll = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get all attributess'
    #swagger.description = 'Endpoint to retrieve all attributess.'
    #swagger.responses[200] = {
      description: 'Attributess retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/AttributesDTO' } }
    }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  try {
    const attributess = await getAttributes();
    res.status(StatusCodes.OK).json(attributess);
  } catch (err) {
    handleError(res, err, "Error retrieving attributess");
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Update a attributes'
    #swagger.description = 'Endpoint to update an existing attributes.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the attributes to update',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/UpdateAttributesDTO' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'Attributes updated successfully.',
      schema: { $ref: '#/definitions/AttributesDTO' }
    }
    #swagger.responses[404] = { description: 'Attributes not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedAttributes = await updateAttributes(id, updateData);
    res.status(StatusCodes.OK).json(updatedAttributes);
  } catch (err) {
    handleError(res, err, "Error updating attributes");
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Delete a attributes'
    #swagger.description = 'Endpoint to delete a attributes.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the attributes to delete',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Attributes deleted successfully.',
      schema: { $ref: '#/definitions/AttributesDTO' }
    }
    #swagger.responses[404] = { description: 'Attributes not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const deletedAttributes = await deleteAttributes(id);
    res.status(StatusCodes.OK).json(deletedAttributes);
  } catch (err) {
    handleError(res, err, "Error deleting attributes");
  }
};

export default { create, getById, getByKind, getAll, update, remove };
