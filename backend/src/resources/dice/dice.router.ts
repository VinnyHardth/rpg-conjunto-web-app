import { Router } from "express";

import validateRequestBody from "../../middlewares/validateRequestBody";
import {
  rollDifficultySchema,
  rollCustomSchema,
  clearDiceSchema
} from "./dice.schemas";
import {
  rollByDifficulty,
  rollByExpression,
  clearDiceRolls
} from "./dice.controllers";

const router = Router();

router.post(
  "/difficulty",
  /*
    #swagger.summary = 'Executa um teste de atributo/pericia'
    #swagger.description = 'Rola 1d20 e soma os modificadores informados.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              attributeValue: { type: 'number' },
              expertiseName: { type: ['string', 'null'] },
              expertiseValue: { type: 'number' },
              miscBonus: { type: 'number' }
            },
            required: ['attributeValue']
          }
        }
      }
    }
    #swagger.responses[200] = { description: 'Rolagem executada com sucesso.' }
    #swagger.responses[400] = { description: 'Parâmetros inválidos.' }
    #swagger.responses[500] = { descricao: 'Erro interno.' }
  */
  validateRequestBody(rollDifficultySchema),
  rollByDifficulty
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
  rollByExpression
);

router.post("/clear", validateRequestBody(clearDiceSchema), clearDiceRolls);

export default router;
