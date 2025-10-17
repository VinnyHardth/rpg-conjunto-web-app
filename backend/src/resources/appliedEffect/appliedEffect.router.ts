import { Router } from "express";
import validateRequestBody from "../../middlewares/validateRequestBody";
import appliedeffectController from "./appliedEffect.controllers";
import * as appliedeffectSchemas from "./appliedEffect.schemas";

const router = Router();

// read methods ---------------------------------------------------------------
router.get("/", appliedeffectController.getAll);
router.get("/:id", appliedeffectController.getById);
// Rota para buscar todos os efeitos aplicados a um personagem específico
router.get("/character/:characterId", appliedeffectController.getByCharacterId);

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

// combat engine method -------------------------------------------------------
router.post(
  "/turn",
  validateRequestBody(appliedeffectSchemas.applyEffectSchema),
  appliedeffectController.applyTurn // nova rota para aplicar efeitos por turno
);
router.post("/:id/tick", appliedeffectController.tick);
router.post("/tick/all", appliedeffectController.tickAll);
router.post(
  "/character/:characterId/tick",
  appliedeffectController.tickByCharacter
);

// delete methods -------------------------------------------------------------
router.delete("/:id", appliedeffectController.remove);

export default router;
