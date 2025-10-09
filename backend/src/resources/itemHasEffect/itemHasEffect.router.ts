import { Router } from "express";
import validateRequestBody from "../../middlewares/validateRequestBody";
import itemhaseffectController from "./itemHasEffect.controllers";
import * as itemhaseffectSchemas from "./itemHasEffect.schemas";

const router = Router();

// read methods ---------------------------------------------------------------
router.get("/", itemhaseffectController.getAll);
router.get("/:id", itemhaseffectController.getById);

// write methods --------------------------------------------------------------
router.post(
  "/",
  validateRequestBody(itemhaseffectSchemas.createItemHasEffectSchema),
  itemhaseffectController.create,
);
router.put(
  "/:id",
  validateRequestBody(itemhaseffectSchemas.updateItemHasEffectSchema),
  itemhaseffectController.update,
);

// delete methods -------------------------------------------------------------
router.delete("/:id", itemhaseffectController.remove);

export default router;
