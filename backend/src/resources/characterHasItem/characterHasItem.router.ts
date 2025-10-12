import { Router } from "express";
import validateRequestBody from "../../middlewares/validateRequestBody";
import characterhasitemController from "./characterHasItem.controllers";
import * as characterhasitemSchemas from "./characterHasItem.schemas";

const router = Router();

// read methods ---------------------------------------------------------------
router.get("/", characterhasitemController.getAll);
router.get("/:id", characterhasitemController.getById);
router.get("/character/:characterId", characterhasitemController.getByCharacterId);

// write methods --------------------------------------------------------------
router.post(
  "/",
  validateRequestBody(characterhasitemSchemas.createCharacterHasItemSchema),
  characterhasitemController.create,
);
router.put(
  "/:id",
  validateRequestBody(characterhasitemSchemas.updateCharacterHasItemSchema),
  characterhasitemController.update,
);

// delete methods -------------------------------------------------------------
router.delete("/:id", characterhasitemController.remove);

export default router;
