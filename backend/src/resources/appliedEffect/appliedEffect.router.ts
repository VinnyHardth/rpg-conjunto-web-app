import { Router } from "express";
import validateRequestBody from "../../middlewares/validateRequestBody";
import appliedeffectController from "./appliedEffect.controllers";
import * as appliedeffectSchemas from "./appliedEffect.schemas";

const router = Router();

// read methods ---------------------------------------------------------------
router.get("/", appliedeffectController.getAll);
router.get("/:id", appliedeffectController.getById);

// write methods --------------------------------------------------------------
router.post(
  "/",
  validateRequestBody(appliedeffectSchemas.createAppliedEffectSchema),
  appliedeffectController.create
);
router.put(
  "/:id",
  validateRequestBody(appliedeffectSchemas.updateAppliedEffectSchema),
  appliedeffectController.update
);

// delete methods -------------------------------------------------------------
router.delete("/:id", appliedeffectController.remove);

export default router;
