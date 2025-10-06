import { Router } from 'express';
import validateRequestBody from '../../middlewares/validateRequestBody';
import statusController from './status.controllers';
import * as statusSchemas from './status.schemas';

const router = Router();

// read methods ---------------------------------------------------------------
router.get('/', statusController.getAll);
router.get('/:id', statusController.getById);
router.get('/character/:characterId', statusController.getByCharacterId);

// write methods --------------------------------------------------------------
router.post('/', validateRequestBody(statusSchemas.createStatusSchema), statusController.create);
router.put('/:id', validateRequestBody(statusSchemas.updateStatusSchema), statusController.update);

// delete methods -------------------------------------------------------------
router.delete('/:id', statusController.remove);

export default router;
