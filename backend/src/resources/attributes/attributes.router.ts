import { Router } from "express";
import validateRequestBody from "../../middlewares/validateRequestBody";
import attributesController from "./attributes.controllers";
import * as attributesSchemas from "./attributes.schemas";

const router = Router();

// read methods ---------------------------------------------------------------
router.get("/", attributesController.getAll);
router.get("/:id", attributesController.getById);
router.get("/kind/:kind", attributesController.getByKind);
router.get("/character/:characterId", attributesController.getByCharacterId);

// write methods --------------------------------------------------------------
router.post(
  "/",
  validateRequestBody(attributesSchemas.createAttributesSchema),
  attributesController.create
);
router.put(
  "/:id",
  validateRequestBody(attributesSchemas.updateAttributesSchema),
  attributesController.update
);

// delete methods -------------------------------------------------------------
router.delete("/:id", attributesController.remove);

export default router;
