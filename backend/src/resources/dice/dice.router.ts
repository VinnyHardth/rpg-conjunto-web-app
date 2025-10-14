import { Router } from "express";

import validateRequestBody from "../../middlewares/validateRequestBody";
import {
  rollDifficultySchema,
  rollCustomSchema,
  clearDiceSchema,
} from "./dice.schemas";
import {
  rollByDifficulty,
  rollByExpression,
  clearDiceRolls,
} from "./dice.controllers";

const router = Router();

router.post(
  "/difficulty",
  /*
    #swagger.summary = 'Roll dice based on difficulty level'
    #swagger.description = 'Executes a dice roll using Xd6 with thresholds tied to the provided difficulty.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              diceCount: { type: 'integer', minimum: 1 },
              difficulty: { type: 'string', enum: ['Fácil', 'Médio', 'Difícil'] }
            },
            required: ['diceCount', 'difficulty']
          }
        }
      }
    }
    #swagger.responses[200] = { description: 'Rolagem executada com sucesso.' }
    #swagger.responses[400] = { description: 'Parâmetros inválidos.' }
    #swagger.responses[500] = { description: 'Erro interno.' }
  */
  validateRequestBody(rollDifficultySchema),
  rollByDifficulty,
);

router.post(
  "/custom",
  /*
    #swagger.summary = 'Roll dice based on a custom expression'
    #swagger.description = 'Executes a dice roll using the provided dice expression.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              expression: { type: 'string' }
            },
            required: ['expression']
          }
        }
      }
    }
  */
  validateRequestBody(rollCustomSchema),
  rollByExpression,
);

router.post("/clear", validateRequestBody(clearDiceSchema), clearDiceRolls);

export default router;
