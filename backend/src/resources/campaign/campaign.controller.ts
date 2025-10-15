import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

import {
  createCampaign,
  getCampaignById,
  getCampaigns,
  getCampaignsByCreatorId,
  updateCampaign,
  deleteCampaign
} from "./campaign.services";
import { getCampaignMembersByCampaignId } from "../campaignMember/campaignMember.services";

const handleError = (res: Response, err: unknown, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR
  });
};

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create a new campaign'
    #swagger.description = 'Endpoint to create a new campaign.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/CreateCampaignDTO' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Campaign created successfully.',
      schema: { $ref: '#/definitions/CampaignDTO' }
    }
  */

  try {
    const newCampaign = await createCampaign(req.body);
    res.status(StatusCodes.CREATED).json(newCampaign);
  } catch (err) {
    handleError(res, err, "Error creating campaign");
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get campaign by ID'
    #swagger.description = 'Endpoint to retrieve a campaign by ID.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the campaign to retrieve',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Campaign retrieved successfully.',
      schema: { $ref: '#/definitions/CampaignDTO' }
    }
  */

  const { id } = req.params;

  try {
    const campaign = await getCampaignById(id);
    if (!campaign) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Campaign not found" });
      return;
    }
    res.status(StatusCodes.OK).json(campaign);
  } catch (err) {
    handleError(res, err, "Error retrieving campaign");
  }
};

const getByCreatorId = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get campaigns by creator ID'
    #swagger.description = 'Endpoint to retrieve campaigns created by a specific user.'
    #swagger.parameters['creatorId'] = {
      in: 'path',
      description: 'Creator ID used to filter campaigns',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Campaigns retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/CampaignDTO' } }
    }
  */

  const { creatorId } = req.params;

  try {
    const campaigns = await getCampaignsByCreatorId(creatorId);
    res.status(StatusCodes.OK).json(campaigns);
  } catch (err) {
    handleError(res, err, "Error retrieving campaigns by creator");
  }
};

const getAll = async (_req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get all campaigns'
    #swagger.description = 'Endpoint to retrieve all campaigns.'
    #swagger.responses[200] = {
      description: 'Campaigns retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/CampaignDTO' } }
    }
  */

  try {
    const campaigns = await getCampaigns();
    res.status(StatusCodes.OK).json(campaigns);
  } catch (err) {
    handleError(res, err, "Error retrieving campaigns");
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Update a campaign'
    #swagger.description = 'Endpoint to update an existing campaign.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the campaign to update',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/UpdateCampaignDTO' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'Campaign updated successfully.',
      schema: { $ref: '#/definitions/CampaignDTO' }
    }
  */

  const { id } = req.params;

  try {
    const updatedCampaign = await updateCampaign(id, req.body);
    res.status(StatusCodes.OK).json(updatedCampaign);
  } catch (err) {
    handleError(res, err, "Error updating campaign");
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Delete a campaign'
    #swagger.description = 'Endpoint to soft delete a campaign.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the campaign to delete',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Campaign deleted successfully.',
      schema: { $ref: '#/definitions/CampaignDTO' }
    }
  */

  const { id } = req.params;

  try {
    const deletedCampaign = await deleteCampaign(id);
    res.status(StatusCodes.OK).json(deletedCampaign);
  } catch (err) {
    handleError(res, err, "Error deleting campaign");
  }
};

const getMembers = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get campaign members'
    #swagger.description = 'Endpoint to retrieve members of a specific campaign.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the campaign to retrieve members for',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Campaign members retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/UserDTO' } }
    }
  */

  const { id } = req.params;

  try {
    const members = await getCampaignMembersByCampaignId(id);
    res.status(StatusCodes.OK).json(members);
  } catch (err) {
    handleError(res, err, "Error retrieving campaign members");
  }
};

export default {
  create,
  getById,
  getByCreatorId,
  getAll,
  update,
  remove,
  getMembers
};
