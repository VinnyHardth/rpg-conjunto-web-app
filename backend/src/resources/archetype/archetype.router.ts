import { Router } from "express";

import validateRequestBody from "../../middlewares/validateRequestBody";
import archetypeController from "./archetype.controllers";
import * as archetypeSchemas from "./archetype.schemas";

const router = Router();

// read methods ---------------------------------------------------------------
router.get("/:id", archetypeController.getById);
router.get("/", archetypeController.getAll);

// write methods --------------------------------------------------------------
router.post(
  "/",
  validateRequestBody(archetypeSchemas.createArchetypeSchema),
  archetypeController.create
);
router.put(
  "/:id",
  validateRequestBody(archetypeSchemas.updateArchetypeSchema),
  archetypeController.update
);

// delete methods -------------------------------------------------------------
router.delete("/:id", archetypeController.remove);

export default router;
