
import { Router } from 'express';

import validateRequestBody from "../../middlewares/validateRequestBody";
import * as itemBonusController from './itemBonus.controller';
import * as itemBonusSchemas from './itemBonus.schemas';
const router = Router();

// read methods ---------------------------------------------------------------
router.get('/:id', itemBonusController.getById);
router.get('/item/:itemId', itemBonusController.getByItemId);

// write methods ---------------------------------------------------------------
router.post('/', validateRequestBody(itemBonusSchemas.createItemBonusSchema), itemBonusController.create);
router.put('/:id', validateRequestBody(itemBonusSchemas.updateItemBonusSchema), itemBonusController.update);

// delete methods -------------------------------------------------------------
router.delete('/:id', itemBonusController.remove);

export default router;
