import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { getCampaignIdsByCharacterId } from "../characterPerCampaign/characterPerCampaign.services";
import {
  createStatus,
  getStatusById,
  getStatusByCharacterId,
  getStatus,
  updateStatus,
  deleteStatus
} from "./status.services";

const handleError = (res: Response, err: any, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR
  });
};

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create a new status'
    #swagger.description = 'Endpoint to create a new status.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/CreateStatusDTO' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Status created successfully.',
      schema: { $ref: '#/definitions/StatusDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const statusData = req.body;

  try {
    const newStatus = await createStatus(statusData);
    res.status(StatusCodes.CREATED).json(newStatus);
  } catch (err) {
    handleError(res, err, "Error creating status");
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get status by ID'
    #swagger.description = 'Endpoint to retrieve a status by ID.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the status to retrieve',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Status retrieved successfully.',
      schema: { $ref: '#/definitions/StatusDTO' }
    }
    #swagger.responses[404] = { description: 'Status not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const status = await getStatusById(id);
    if (!status) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Status not found" });
      return;
    }
    res.status(StatusCodes.OK).json(status);
  } catch (err) {
    handleError(res, err, "Error retrieving status");
  }
};

const getByCharacterId = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get status by character ID'
    #swagger.description = 'Endpoint to retrieve a status by character ID.'
    #swagger.parameters['characterId'] = {
      in: 'path',
      description: 'ID of the character to retrieve status for',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Status retrieved successfully.',
      schema: { $ref: '#/definitions/StatusDTO' }
    }
    #swagger.responses[404] = { description: 'Status not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { characterId } = req.params;

  try {
    const status = await getStatusByCharacterId(characterId);
    if (!status) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Status not found" });
      return;
    }
    res.status(StatusCodes.OK).json(status);
  } catch (err) {
    handleError(res, err, "Error retrieving status");
  }
};

const getAll = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get all statuss'
    #swagger.description = 'Endpoint to retrieve all statuss.'
    #swagger.responses[200] = {
      description: 'Statuss retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/StatusDTO' } }
    }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  try {
    const statuss = await getStatus();
    res.status(StatusCodes.OK).json(statuss);
  } catch (err) {
    handleError(res, err, "Error retrieving statuss");
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Update a status'
    #swagger.description = 'Endpoint to update an existing status.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the status to update',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/UpdateStatusDTO' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'Status updated successfully.',
      schema: { $ref: '#/definitions/StatusDTO' }
    }
    #swagger.responses[404] = { description: 'Status not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedStatus = await updateStatus(id, updateData);
    res.status(StatusCodes.OK).json(updatedStatus);

    if (req.io && updatedStatus) {
      try {
        const [campaignIds, statuses] = await Promise.all([
          getCampaignIdsByCharacterId(updatedStatus.characterId),
          getStatusByCharacterId(updatedStatus.characterId)
        ]);

        campaignIds.forEach((campaignId) => {
          req.io!.to(`campaign-${campaignId}`).emit("status:updated", {
            campaignId,
            characterId: updatedStatus.characterId,
            status: updatedStatus,
            statuses
          });
        });
      } catch (socketError) {
        console.error("Falha ao emitir atualização de status:", socketError);
      }
    }
  } catch (err) {
    handleError(res, err, "Error updating status");
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Delete a status'
    #swagger.description = 'Endpoint to delete a status.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the status to delete',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Status deleted successfully.',
      schema: { $ref: '#/definitions/StatusDTO' }
    }
    #swagger.responses[404] = { description: 'Status not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const deletedStatus = await deleteStatus(id);
    res.status(StatusCodes.OK).json(deletedStatus);
  } catch (err) {
    handleError(res, err, "Error deleting status");
  }
};

export default { create, getById, getByCharacterId, getAll, update, remove };
