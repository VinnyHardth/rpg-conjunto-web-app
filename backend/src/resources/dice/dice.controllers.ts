import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { rollDifficulty, rollCustom } from "./dice.services";
import { DifficultyLabel } from "../../utils/rollDice";

type RollDifficultyRequestBody = {
  campaignId: string;
  characterId: string;
  attributeName: string;
  attributeAbbreviation: string;
  diceCount: number;
  difficulty: DifficultyLabel;
};

const handleServerError = (res: Response, error: unknown): void => {
  console.error("Dice roll error:", error);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR
  });
};

export const rollByDifficulty = async (
  req: Request<unknown, unknown, RollDifficultyRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const {
      campaignId,
      characterId,
      attributeName,
      attributeAbbreviation,
      diceCount,
      difficulty
    } = req.body;

    const result = rollDifficulty({ diceCount, difficulty });
    const payload = {
      ...result,
      campaignId,
      characterId,
      attributeName,
      attributeAbbreviation
    };
    res.status(StatusCodes.OK).json(payload);
    if (req.io) {
      const room = `campaign-${campaignId}`;
      req.io.to(room).emit("dice:rolled", payload);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("diceCount")) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: error.message
      });
      return;
    }

    handleServerError(res, error);
  }
};

export const rollByExpression = async (
  req: Request<unknown, unknown, { expression: string }>,
  res: Response
): Promise<void> => {
  try {
    const result = rollCustom(req.body.expression);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    handleServerError(res, error);
  }
};

export const clearDiceRolls = async (
  req: Request<unknown, unknown, { campaignId: string }>,
  res: Response
): Promise<void> => {
  const { campaignId } = req.body;

  if (!campaignId) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: "campaignId is required."
    });
    return;
  }

  res.status(StatusCodes.OK).json({ campaignId });

  if (req.io) {
    req.io.to(`campaign-${campaignId}`).emit("dice:cleared", { campaignId });
  }
};
