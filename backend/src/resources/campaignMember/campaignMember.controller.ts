import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

import {
  createCampaignMember,
  getCampaignMemberById,
  getCampaignMembers,
  getCampaignMembersByCampaignId,
  getCampaignMembersByUserId,
  updateCampaignMember,
  deleteCampaignMember
} from "./campaignMember.services";

const handleError = (res: Response, err: unknown, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR
  });
};

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Add a member to a campaign'
  */
  try {
    const member = await createCampaignMember(req.body);
    res.status(StatusCodes.CREATED).json(member);
  } catch (err) {
    handleError(res, err, "Error creating campaign member");
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get campaign member by ID'
  */
  const { id } = req.params;

  try {
    const member = await getCampaignMemberById(id);
    if (!member) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Campaign member not found" });
      return;
    }
    res.status(StatusCodes.OK).json(member);
  } catch (err) {
    handleError(res, err, "Error retrieving campaign member");
  }
};

const getAll = async (_req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get all campaign members'
  */
  try {
    const members = await getCampaignMembers();
    res.status(StatusCodes.OK).json(members);
  } catch (err) {
    handleError(res, err, "Error retrieving campaign members");
  }
};

const getByCampaignId = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get campaign members by campaign ID'
  */
  const { campaignId } = req.params;

  try {
    const members = await getCampaignMembersByCampaignId(campaignId);
    res.status(StatusCodes.OK).json(members);
  } catch (err) {
    handleError(res, err, "Error retrieving campaign members for campaign");
  }
};

const getByUserId = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get campaigns for a user'
  */
  const { userId } = req.params;

  try {
    const members = await getCampaignMembersByUserId(userId);
    res.status(StatusCodes.OK).json(members);
  } catch (err) {
    handleError(res, err, "Error retrieving campaign members for user");
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Update campaign member'
  */
  const { id } = req.params;

  try {
    const member = await updateCampaignMember(id, req.body);
    res.status(StatusCodes.OK).json(member);
  } catch (err) {
    handleError(res, err, "Error updating campaign member");
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Delete campaign member'
  */
  const { id } = req.params;

  try {
    const member = await deleteCampaignMember(id);
    res.status(StatusCodes.OK).json(member);
  } catch (err) {
    handleError(res, err, "Error deleting campaign member");
  }
};

export default {
  create,
  getById,
  getAll,
  getByCampaignId,
  getByUserId,
  update,
  remove
};
