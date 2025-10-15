import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import {
  createSkill,
  getSkillByCharacterId,
  getSkillById,
  getSkills,
  updateSkill,
  deleteSkill
} from "./skill.services";

const handleError = (res: Response, err: any, context: string): void => {
  console.error(`${context}:`, err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ReasonPhrases.INTERNAL_SERVER_ERROR
  });
};

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create a new skill'
    #swagger.description = 'Endpoint to create a new skill.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/CreateSkillDTO' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Skill created successfully.',
      schema: { $ref: '#/definitions/SkillDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const skillData = req.body;

  try {
    const newSkill = await createSkill(skillData);
    res.status(StatusCodes.CREATED).json(newSkill);
  } catch (err) {
    handleError(res, err, "Error creating skill");
  }
};

const getByCharacterId = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get skills by character ID'
    #swagger.description = 'Endpoint to retrieve skills by character ID.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the character to retrieve skills for',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Skills retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/SkillDTO' } }
    }
    #swagger.responses[404] = { description: 'Character not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { characterId } = req.params;

  try {
    const skills = await getSkillByCharacterId(characterId);
    res.status(StatusCodes.OK).json(skills);
  } catch (err) {
    handleError(res, err, "Error retrieving skills");
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get skill by ID'
    #swagger.description = 'Endpoint to retrieve a skill by ID.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the skill to retrieve',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Skill retrieved successfully.',
      schema: { $ref: '#/definitions/SkillDTO' }
    }
    #swagger.responses[404] = { description: 'Skill not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const skill = await getSkillById(id);
    if (!skill) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Skill not found" });
      return;
    }
    res.status(StatusCodes.OK).json(skill);
  } catch (err) {
    handleError(res, err, "Error retrieving skill");
  }
};

const getAll = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Get all skills'
    #swagger.description = 'Endpoint to retrieve all skills.'
    #swagger.responses[200] = {
      description: 'Skills retrieved successfully.',
      schema: { type: 'array', items: { $ref: '#/definitions/SkillDTO' } }
    }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  try {
    const skills = await getSkills();
    res.status(StatusCodes.OK).json(skills);
  } catch (err) {
    handleError(res, err, "Error retrieving skills");
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Update a skill'
    #swagger.description = 'Endpoint to update an existing skill.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the skill to update',
      required: true,
      type: 'string'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/definitions/UpdateSkillDTO' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'Skill updated successfully.',
      schema: { $ref: '#/definitions/SkillDTO' }
    }
    #swagger.responses[404] = { description: 'Skill not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedSkill = await updateSkill(id, updateData);
    res.status(StatusCodes.OK).json(updatedSkill);
  } catch (err) {
    handleError(res, err, "Error updating skill");
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Delete a skill'
    #swagger.description = 'Endpoint to delete a skill.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the skill to delete',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Skill deleted successfully.',
      schema: { $ref: '#/definitions/SkillDTO' }
    }
    #swagger.responses[404] = { description: 'Skill not found' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const { id } = req.params;

  try {
    const deletedSkill = await deleteSkill(id);
    res.status(StatusCodes.OK).json(deletedSkill);
  } catch (err) {
    handleError(res, err, "Error deleting skill");
  }
};

export default { create, getByCharacterId, getById, getAll, update, remove };
