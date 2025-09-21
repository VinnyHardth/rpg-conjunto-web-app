import { Router } from 'express';
import validateRequestBody from '../../middlewares/validateRequestBody';
import itemskillsController from './itemSkills.controllers';
import * as itemskillsSchemas from './itemSkills.schemas';

const router = Router();

// read methods ---------------------------------------------------------------
router.get('/', itemskillsController.getAll);
router.get('/:id', itemskillsController.getById);

// write methods --------------------------------------------------------------
router.post('/', validateRequestBody(itemskillsSchemas.createItemSkillsSchema), itemskillsController.create);
router.put('/:id', validateRequestBody(itemskillsSchemas.updateItemSkillsSchema), itemskillsController.update);

// delete methods -------------------------------------------------------------
router.delete('/:id', itemskillsController.remove);

export default router;
