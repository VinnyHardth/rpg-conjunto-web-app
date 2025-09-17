
import { Router } from 'express';

import validateRequestBody from "../../middlewares/validateRequestBody";
import charStateController from './charState.controller';
import * as charStateSchemas from './charState.schemas';
const router = Router();

// read methods ---------------------------------------------------------------
router.get('/:id', charStateController.getById);
router.get('/character/:characterId', charStateController.getByCharacterId);

// write methods ---------------------------------------------------------------
router.post('/', validateRequestBody(charStateSchemas.createCharStateSchema), charStateController.create);
router.put('/:id', validateRequestBody(charStateSchemas.updateCharStateSchema), charStateController.update);
router.put('/system/:characterId', validateRequestBody(charStateSchemas.updateCharStateSchema), charStateController.systemUpdate);

// delete methods -------------------------------------------------------------
router.delete('/:id', charStateController.remove);

export default router;
