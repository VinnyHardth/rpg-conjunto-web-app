import { Router } from 'express';

import validateRequestBody from '../../middlewares/validateRequestBody';
import abilitiesController from './abilities.controllers';
import * as abilitiesSchemas from './abilities.schemas';

const router = Router();

// read methods ---------------------------------------------------------------
router.get('/', abilitiesController.getAll);
router.get('/:id', abilitiesController.getById);

// write methods --------------------------------------------------------------
router.post('/', validateRequestBody(abilitiesSchemas.createAbilitiesSchema), abilitiesController.create);
router.put('/:id', validateRequestBody(abilitiesSchemas.updateAbilitiesSchema), abilitiesController.update);

// delete methods -------------------------------------------------------------
router.delete('/:id', abilitiesController.remove);

export default router;
