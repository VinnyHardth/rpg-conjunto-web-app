
import { Router } from 'express';

import validateRequestBody from "../../middlewares/validateRequestBody";
import * as inventoryController from './inventory.controller';
import * as inventorySchemas from './inventory.schemas';
const router = Router();

// read methods ---------------------------------------------------------------
router.get('/', inventoryController.getByCharacterId);

// write methods ---------------------------------------------------------------
router.post('/', validateRequestBody(inventorySchemas.createInventorySchema), inventoryController.create);
router.put('/:id', validateRequestBody(inventorySchemas.updateInventorySchema), inventoryController.update);

// delete methods -------------------------------------------------------------
router.delete('/:id', inventoryController.remove);

export default router;
