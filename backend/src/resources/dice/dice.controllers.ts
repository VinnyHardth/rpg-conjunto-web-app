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
  /*
    #swagger.tags = ['Dice']
    #swagger.summary = 'Rola dados com base em um nível de dificuldade'
    #swagger.description = 'Executa uma rolagem de dados Xd6 com limiares atrelados à dificuldade informada.'
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
              diceCount: { type: 'integer', minimum: 1 },
              difficulty: { type: 'string', enum: ['Fácil','Médio','Difícil'] }
            },
            required: ['campaignId','characterId','attributeName','attributeAbbreviation','diceCount','difficulty']
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
