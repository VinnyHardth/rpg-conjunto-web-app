import { Router } from "express";
import validateRequestBody from "../../middlewares/validateRequestBody";
import effecttargetController from "./effectModifier.controllers";
import * as effecttargetSchemas from "./effectModifier.schemas";

const router = Router();

// read methods ---------------------------------------------------------------
router.get("/", effecttargetController.getAll);
router.get("/:id", effecttargetController.getById);

// write methods --------------------------------------------------------------
router.post(
  "/",
  validateRequestBody(effecttargetSchemas.createEffectTargetSchema),
  effecttargetController.create,
);
router.put(
  "/:id",
  validateRequestBody(effecttargetSchemas.updateEffectTargetSchema),
  effecttargetController.update,
);

// delete methods -------------------------------------------------------------
router.delete("/:id", effecttargetController.remove);

export default router;
