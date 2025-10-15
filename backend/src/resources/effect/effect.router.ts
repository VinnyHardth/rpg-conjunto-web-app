import { Router } from "express";
import validateRequestBody from "../../middlewares/validateRequestBody";
import effectController from "./effect.controllers";
import * as effectSchemas from "./effect.schemas";

const router = Router();

// read methods ---------------------------------------------------------------
router.get("/", effectController.getAll);
router.get("/:id", effectController.getById);

// write methods --------------------------------------------------------------
router.post(
  "/",
  validateRequestBody(effectSchemas.createEffectSchema),
  effectController.create
);
router.put(
  "/:id",
  validateRequestBody(effectSchemas.updateEffectSchema),
  effectController.update
);

// delete methods -------------------------------------------------------------
router.delete("/:id", effectController.remove);

export default router;
