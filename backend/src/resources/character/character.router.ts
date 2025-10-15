import { Router } from "express";

import validateRequestBody from "../../middlewares/validateRequestBody";
import characterController from "./character.controller";
import * as characterSchemas from "./character.schemas";

const router = Router();

// read methods ---------------------------------------------------------------
router.get("/", characterController.getAll);
router.get("/:id", characterController.getById);
router.get("/user/:userId", characterController.getUserCharacters);
router.get("/full/:id", characterController.getFullCharacterData);
// write methods ---------------------------------------------------------------
router.post(
  "/",
  validateRequestBody(characterSchemas.createCharacterSchema),
  characterController.create
);

router.put(
  "/:id",
  validateRequestBody(characterSchemas.updateCharacterSchema),
  characterController.update
);

// delete methods -------------------------------------------------------------
router.delete("/:id", characterController.remove);

export default router;
