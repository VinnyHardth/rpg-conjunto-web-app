import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import {
  createAppliedEffect,
  getAppliedEffectById,
  getAppliedEffects,
  updateAppliedEffect,
  deleteAppliedEffect,
  applyEffectTurn // novo método do service
} from "./appliedEffect.services";
import { SourceType } from "@prisma/client";

const handleError = (res: Response, err: any, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR
  });
};

// ---------- CRUD ---------- //

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.tags = ['AppliedEffects']
    #swagger.summary = 'Cria um novo AppliedEffect'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              characterId: { type: 'string', format: 'uuid' },
              effectId: { type: 'string', format: 'uuid' },
              sourceType: { type: 'string', enum: ['ITEM','SKILL','OTHER'] },
              currentTurn: { type: 'integer' },
              duration: { type: 'integer' },
              stacks: { type: 'integer' },
              valuePerStack: { type: 'number' }
            },
            required: ['characterId','effectId','sourceType','currentTurn','duration']
          }
        }
      }
    }
    #swagger.responses[201] = { description: 'AppliedEffect criado com sucesso.' }
    #swagger.responses[500] = { description: 'Erro interno do servidor.' }
  */
  try {
    const newAppliedEffect = await createAppliedEffect(req.body);
    res.status(StatusCodes.CREATED).json(newAppliedEffect);
  } catch (err) {
    handleError(res, err, "Error creating appliedeffect");
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.tags = ['AppliedEffects']
    #swagger.summary = 'Obtém um AppliedEffect pelo ID'
    #swagger.parameters['id'] = { description: 'UUID do AppliedEffect', required: true }
    #swagger.responses[200] = { description: 'AppliedEffect encontrado.' }
    #swagger.responses[404] = { description: 'AppliedEffect não encontrado.' }
    #swagger.responses[500] = { description: 'Erro interno do servidor.' }
  */
  try {
    const appliedeffect = await getAppliedEffectById(req.params.id);
    if (!appliedeffect) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "AppliedEffect not found" });
      return;
    }
    res.status(StatusCodes.OK).json(appliedeffect);
  } catch (err) {
    handleError(res, err, "Error retrieving appliedeffect");
  }
};

const getAll = async (_req: Request, res: Response): Promise<void> => {
  /*
    #swagger.tags = ['AppliedEffects']
    #swagger.summary = 'Lista todos os AppliedEffects'
    #swagger.responses[200] = { description: 'Lista retornada com sucesso.' }
    #swagger.responses[500] = { description: 'Erro interno do servidor.' }
  */
  try {
    const appliedeffects = await getAppliedEffects();
    res.status(StatusCodes.OK).json(appliedeffects);
  } catch (err) {
    handleError(res, err, "Error retrieving appliedeffects");
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.tags = ['AppliedEffects']
    #swagger.summary = 'Atualiza um AppliedEffect existente'
    #swagger.parameters['id'] = { description: 'UUID do AppliedEffect', required: true }
    #swagger.requestBody = {
      required: true,
      content: { 'application/json': { schema: { $ref: '#/components/schemas/AppliedEffectUpdate' } } }
    }
    #swagger.responses[200] = { description: 'AppliedEffect atualizado com sucesso.' }
    #swagger.responses[500] = { description: 'Erro interno do servidor.' }
  */
  try {
    const updatedAppliedEffect = await updateAppliedEffect(
      req.params.id,
      req.body
    );
    res.status(StatusCodes.OK).json(updatedAppliedEffect);
  } catch (err) {
    handleError(res, err, "Error updating appliedeffect");
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.tags = ['AppliedEffects']
    #swagger.summary = 'Remove um AppliedEffect pelo ID'
    #swagger.parameters['id'] = { description: 'UUID do AppliedEffect', required: true }
    #swagger.responses[200] = { description: 'AppliedEffect removido com sucesso.' }
    #swagger.responses[500] = { description: 'Erro interno do servidor.' }
  */
  try {
    const deletedAppliedEffect = await deleteAppliedEffect(req.params.id);
    res.status(StatusCodes.OK).json(deletedAppliedEffect);
  } catch (err) {
    handleError(res, err, "Error deleting appliedeffect");
  }
};

// ---------- NOVO: Aplicação por turno ---------- //

const applyTurn = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.tags = ['AppliedEffects']
    #swagger.summary = 'Aplica um efeito em um personagem no turno atual'
    #swagger.description = 'Resolve buffs, debuffs e efeitos instantâneos (HP/MP/etc).'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              characterId: { type: 'string', format: 'uuid' },
              effectId: { type: 'string', format: 'uuid' },
              sourceType: { type: 'string', enum: ['ITEM','SKILL','OTHER'] },
              currentTurn: { type: 'integer', example: 5 },
              duration: { type: 'integer', example: 3 },
              stacksDelta: { type: 'integer', example: 1 },
              valuePerStack: { type: 'number', example: 10 }
            },
            required: ['characterId','effectId','sourceType','currentTurn','duration']
          }
        }
      }
    }
    #swagger.responses[200] = { description: 'Efeito aplicado com sucesso.' }
    #swagger.responses[400] = { description: 'Campos obrigatórios ausentes.' }
    #swagger.responses[500] = { description: 'Erro interno do servidor.' }
  */
  try {
    const {
      characterId,
      effectId,
      sourceType,
      currentTurn,
      duration,
      stacksDelta,
      valuePerStack
    } = req.body;

    if (
      !characterId ||
      !effectId ||
      !sourceType ||
      !currentTurn ||
      duration === undefined
    ) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Missing required fields" });
      return;
    }

    const result = await applyEffectTurn({
      characterId,
      effectId,
      sourceType: sourceType as SourceType,
      currentTurn: Number(currentTurn),
      duration: Number(duration),
      stacksDelta: Number(stacksDelta ?? 1),
      valuePerStack: Number(valuePerStack ?? 0)
    });

    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    handleError(res, err, "Error applying effect turn");
  }
};

export default {
  create,
  getById,
  getAll,
  update,
  remove,
  applyTurn
};
