import { Router } from "express";
import validateRequestBody from "../../middlewares/validateRequestBody";
import abilityeffectController from "./abilityEffect.controllers";
import * as abilityeffectSchemas from "./abilityEffect.schemas";

const router = Router();

// read methods ---------------------------------------------------------------
router.get("/", abilityeffectController.getAll);
router.get("/:id", abilityeffectController.getById);

// write methods --------------------------------------------------------------
router.post(
  "/",
  validateRequestBody(abilityeffectSchemas.createAbilityEffectSchema),
  abilityeffectController.create,
);
router.put(
  "/:id",
  validateRequestBody(abilityeffectSchemas.updateAbilityEffectSchema),
  abilityeffectController.update,
);

// delete methods -------------------------------------------------------------
router.delete("/:id", abilityeffectController.remove);

export default router;
