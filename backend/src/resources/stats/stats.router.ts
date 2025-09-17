
import { Router } from 'express';

import validateRequestBody from "../../middlewares/validateRequestBody";
import statsController from './stats.controller';
import * as statsSchemas from './stats.schemas';
const router = Router();

// read methods ---------------------------------------------------------------
router.get('/:id', statsController.getById);
router.get('/character/:characterId', statsController.getByCharacterId);

// write methods ---------------------------------------------------------------
router.post('/', validateRequestBody(statsSchemas.createStatsSchema), statsController.create);
router.put('/:id', validateRequestBody(statsSchemas.updateStatsSchema), statsController.update);

// delete methods -------------------------------------------------------------
router.delete('/:id', statsController.remove);

export default router;
