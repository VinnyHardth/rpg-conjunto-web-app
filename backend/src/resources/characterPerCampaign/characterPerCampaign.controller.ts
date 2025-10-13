import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

import {
  createCharacterPerCampaign,
  getCharacterPerCampaignById,
  getCharacterPerCampaigns,
  getCharacterPerCampaignsByCampaignId,
  getCharacterPerCampaignsByCharacterId,
  updateCharacterPerCampaign,
  deleteCharacterPerCampaign,
  getCharacterPerCampaignWithCharacterById,
} from "./characterPerCampaign.services";

const handleError = (res: Response, err: unknown, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
};

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create a character-campaign relation'
    #swagger.description = 'Link a character to a campaign.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/CreateCharacterPerCampaignDTO' }
        }
      }
    }
  */
  try {
    const relation = await createCharacterPerCampaign(req.body);
    const enrichedRelation =
      (await getCharacterPerCampaignWithCharacterById(relation.id)) ?? relation;

    res.status(StatusCodes.CREATED).json(enrichedRelation);

    if (req.io) {
      const payload = {
        campaignId: relation.campaignId,
        relation: enrichedRelation,
      };
      req.io
        .to(`campaign-${relation.campaignId}`)
        .emit("campaign:characterLinked", payload);
    }
  } catch (err) {
    handleError(res, err, "Error creating character-per-campaign relation");
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get character-campaign relation by ID'
  */
  const { id } = req.params;

  try {
    const relation = await getCharacterPerCampaignById(id);
    if (!relation) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "CharacterPerCampaign not found" });
      return;
    }
    res.status(StatusCodes.OK).json(relation);
  } catch (err) {
    handleError(res, err, "Error retrieving character-per-campaign relation");
  }
};

const getAll = async (_req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get all character-campaign relations'
  */
  try {
    const relations = await getCharacterPerCampaigns();
    res.status(StatusCodes.OK).json(relations);
  } catch (err) {
    handleError(res, err, "Error retrieving character-per-campaign relations");
  }
};

const getByCampaignId = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get character-campaign relations by campaign ID'
  */
  const { campaignId } = req.params;

  try {
    const relations = await getCharacterPerCampaignsByCampaignId(campaignId);
    res.status(StatusCodes.OK).json(relations);
  } catch (err) {
    handleError(
      res,
      err,
      "Error retrieving character-per-campaign relations for campaign",
    );
  }
};

const getByCharacterId = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get character-campaign relations by character ID'
  */
  const { characterId } = req.params;

  try {
    const relations = await getCharacterPerCampaignsByCharacterId(characterId);
    res.status(StatusCodes.OK).json(relations);
  } catch (err) {
    handleError(
      res,
      err,
      "Error retrieving character-per-campaign relations for character",
    );
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Update a character-campaign relation'
  */
  const { id } = req.params;

  try {
    const relation = await updateCharacterPerCampaign(id, req.body);
    res.status(StatusCodes.OK).json(relation);
  } catch (err) {
    handleError(res, err, "Error updating character-per-campaign relation");
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Delete a character-campaign relation'
  */
  const { id } = req.params;

  try {
    const relation = await deleteCharacterPerCampaign(id);
    const responsePayload = { ...relation, character: null };
    res.status(StatusCodes.OK).json(responsePayload);

    if (req.io) {
      const payload = {
        campaignId: relation.campaignId,
        relation: responsePayload,
      };
      req.io
        .to(`campaign-${relation.campaignId}`)
        .emit("campaign:characterUnlinked", payload);
    }
  } catch (err) {
    handleError(res, err, "Error deleting character-per-campaign relation");
  }
};

export default {
  create,
  getById,
  getAll,
  getByCampaignId,
  getByCharacterId,
  update,
  remove,
};
