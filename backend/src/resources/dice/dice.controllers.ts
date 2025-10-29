import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { rollDifficulty, rollCustom } from "./dice.services";

type RollDifficultyRequestBody = {
  campaignId: string;
  characterId: string;
  attributeName: string;
  attributeAbbreviation: string;
  attributeValue: number;
  expertiseName?: string | null;
  expertiseValue?: number | null;
  miscBonus?: number | null;
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
  /*
    #swagger.tags = ['Dice']
    #swagger.summary = 'Rola um teste de atributo/perícia'
    #swagger.description = 'Executa uma rolagem de 1d20 somando os modificadores informados.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              campaignId: { type: 'string', format: 'uuid' },
              characterId: { type: 'string', format: 'uuid' },
              attributeName: { type: 'string' },
              attributeAbbreviation: { type: 'string' },
              attributeValue: { type: 'number' },
              expertiseName: { type: ['string', 'null'] },
              expertiseValue: { type: 'number' },
              miscBonus: { type: 'number' }
            },
            required: ['campaignId','characterId','attributeName','attributeAbbreviation','attributeValue']
          }
        }
      }
    }
    #swagger.responses[200] = { description: 'Rolagem executada com sucesso.' }
    #swagger.responses[400] = { description: 'Parâmetros inválidos.' }
    #swagger.responses[500] = { description: 'Erro interno do servidor.' }
  */
  try {
    const {
      campaignId,
      characterId,
      attributeName,
      attributeAbbreviation,
      attributeValue,
      expertiseName,
      expertiseValue,
      miscBonus
    } = req.body;

    const result = rollDifficulty({
      attributeValue,
      expertiseValue,
      miscBonus
    });
    const payload = {
      ...result,
      campaignId,
      characterId,
      attributeName,
      attributeAbbreviation,
      attributeValue: result.modifiers.attribute,
      expertiseName: expertiseName ?? null,
      expertiseValue: result.modifiers.expertise,
      miscBonus: result.modifiers.misc
    };
    res.status(StatusCodes.OK).json(payload);
    if (req.io) {
      const room = `campaign-${campaignId}`;
      req.io.to(room).emit("dice:rolled", payload);
    }
  } catch (error) {
    handleServerError(res, error);
  }
};

export const rollByExpression = async (
  req: Request<unknown, unknown, { expression: string }>,
  res: Response
): Promise<void> => {
  /*
    #swagger.tags = ['Dice']
    #swagger.summary = 'Rola dados com base em uma expressão personalizada'
    #swagger.description = 'Permite rolar dados informando expressões como "2d6+3" ou "1d20-1".'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              expression: { type: 'string', example: '2d6+3' }
            },
            required: ['expression']
          }
        }
      }
    }
    #swagger.responses[200] = { description: 'Expressão de rolagem executada com sucesso.' }
    #swagger.responses[500] = { description: 'Erro interno do servidor.' }
  */
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
  /*
    #swagger.tags = ['Dice']
    #swagger.summary = 'Limpa o histórico de rolagens de uma campanha'
    #swagger.description = 'Remove ou reinicia o histórico de rolagens de uma campanha específica e notifica via WebSocket.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              campaignId: { type: 'string', format: 'uuid' }
            },
            required: ['campaignId']
          }
        }
      }
    }
    #swagger.responses[200] = { description: 'Rolagens limpas com sucesso.' }
    #swagger.responses[400] = { description: 'O campo campaignId é obrigatório.' }
    #swagger.responses[500] = { description: 'Erro interno do servidor.' }
  */
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
