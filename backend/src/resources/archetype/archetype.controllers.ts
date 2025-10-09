import { Request, Response } from "express";
import {
  createArchetype,
  getArchetypeById,
  getArchetypes,
  updateArchetype,
  deleteArchetype,
} from "./archetype.services";

const create = async (req: Request, res: Response) => {
  /*
    #swagger.summary = 'Create a new archetype'
    #swagger.description = 'Endpoint to create a new archetype.'

    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/CreateArchetypeDTO' }
        }
      }
    }

    #swagger.responses[201] = {
      description: 'Archetype created successfully.',
      schema: { $ref: '#/definitions/ArchetypeDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity (validation failed)' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const archetypeData = req.body;

  try {
    const newArchetype = await createArchetype(archetypeData);
    res.status(201).json(newArchetype);
  } catch (err) {
    res.status(500).json({ message: "Error creating archetype", error: err });
  }
};

const getById = async (req: Request, res: Response) => {
  /*
    #swagger.summary = 'Get archetype by ID'
    #swagger.description = 'Endpoint to retrieve an archetype by its ID.'

    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the archetype to retrieve',
      required: true,
      type: 'string'
    }

    #swagger.responses[200] = {
      description: 'Archetype retrieved successfully.',
      schema: { $ref: '#/definitions/ArchetypeDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[404] = { description: 'Archetype not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const archetype = await getArchetypeById(id);
    if (!archetype) {
      return res.status(404).json({ message: "Archetype not found" });
    }
    res.status(200).json(archetype);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving archetype", error: err });
  }
};

const getAll = async (req: Request, res: Response) => {
  /*
    #swagger.summary = 'Get all archetypes'
    #swagger.description = 'Endpoint to retrieve all archetypes.'

    #swagger.responses[200] = {
      description: 'Archetypes retrieved successfully.',
      schema: { $ref: '#/definitions/ArchetypeDTO' }
    }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  try {
    const archetypes = await getArchetypes();
    res.status(200).json(archetypes);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving archetypes", error: err });
  }
};

const update = async (req: Request, res: Response) => {
  /*
    #swagger.summary = 'Update an archetype'
    #swagger.description = 'Endpoint to update an existing archetype.'

    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the archetype to update',
      required: true,
      type: 'string'
    }

    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/UpdateArchetypeDTO' }
        }
      }
    }

    #swagger.responses[200] = {
      description: 'Archetype updated successfully.',
      schema: { $ref: '#/definitions/ArchetypeDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[404] = { description: 'Archetype not found' }
    #swagger.responses[422] = { description: 'Unprocessable Entity (validation failed)' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedArchetype = await updateArchetype(id, updateData);
    res.status(200).json(updatedArchetype);
  } catch (err) {
    res.status(500).json({ message: "Error updating archetype", error: err });
  }
};

const remove = async (req: Request, res: Response) => {
  /*
    #swagger.summary = 'Delete an archetype'
    #swagger.description = 'Endpoint to delete an existing archetype.'

    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the archetype to delete',
      required: true,
      type: 'string'
    }

    #swagger.responses[200] = {
      description: 'Archetype deleted successfully.',
      schema: { $ref: '#/definitions/ArchetypeDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[404] = { description: 'Archetype not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const deletedArchetype = await deleteArchetype(id);
    res.status(200).json(deletedArchetype);
  } catch (err) {
    res.status(500).json({ message: "Error deleting archetype", error: err });
  }
};

export default { create, getById, getAll, update, remove };
