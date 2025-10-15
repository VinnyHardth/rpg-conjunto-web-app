import { Router } from "express";

import validateRequestBody from "../../middlewares/validateRequestBody";
import controller from "./characterPerCampaign.controller";
import * as schemas from "./characterPerCampaign.schemas";

const router = Router();

router.get("/", controller.getAll);
router.get("/campaign/:campaignId", controller.getByCampaignId);
router.get("/character/:characterId", controller.getByCharacterId);
router.get("/:id", controller.getById);

router.post(
  "/",
  validateRequestBody(schemas.createCharacterPerCampaignSchema),
  controller.create
);

router.put(
  "/:id",
  validateRequestBody(schemas.updateCharacterPerCampaignSchema),
  controller.update
);

router.delete("/:id", controller.remove);

export default router;
