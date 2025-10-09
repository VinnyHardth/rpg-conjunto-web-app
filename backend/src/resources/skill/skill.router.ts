import { Router } from "express";
import validateRequestBody from "../../middlewares/validateRequestBody";
import skillController from "./skill.controllers";
import * as skillSchemas from "./skill.schemas";

const router = Router();

// read methods ---------------------------------------------------------------
router.get("/", skillController.getAll);
router.get("/:id", skillController.getById);

// write methods --------------------------------------------------------------
router.post(
  "/",
  validateRequestBody(skillSchemas.createSkillSchema),
  skillController.create,
);
router.put(
  "/:id",
  validateRequestBody(skillSchemas.updateSkillSchema),
  skillController.update,
);

// delete methods -------------------------------------------------------------
router.delete("/:id", skillController.remove);

export default router;
