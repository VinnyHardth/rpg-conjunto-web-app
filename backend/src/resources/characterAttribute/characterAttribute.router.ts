import { Router } from "express";
import validateRequestBody from "../../middlewares/validateRequestBody";
import characterattributeController from "./characterAttribute.controllers";
import * as characterattributeSchemas from "./characterAttribute.schemas";

const router = Router();

// read methods ---------------------------------------------------------------
router.get("/", characterattributeController.getAll);
router.get("/:id", characterattributeController.getById);
router.get(
  "/character/:characterId",
  characterattributeController.getByCharacterId
);

// write methods --------------------------------------------------------------
router.post(
  "/",
  validateRequestBody(characterattributeSchemas.createCharacterAttributeSchema),
  characterattributeController.create
);
router.put(
  "/:id",
  validateRequestBody(characterattributeSchemas.updateCharacterAttributeSchema),
  characterattributeController.update
);

// delete methods -------------------------------------------------------------
router.delete("/:id", characterattributeController.remove);

export default router;
