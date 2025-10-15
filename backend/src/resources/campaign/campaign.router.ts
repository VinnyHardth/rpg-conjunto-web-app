import { Router } from "express";

import validateRequestBody from "../../middlewares/validateRequestBody";
import campaignController from "./campaign.controller";
import * as campaignSchemas from "./campaign.schemas";

const router = Router();

router.get("/", campaignController.getAll);
router.get("/creator/:creatorId", campaignController.getByCreatorId);
router.get("/:id", campaignController.getById);

router.post(
  "/",
  validateRequestBody(campaignSchemas.createCampaignSchema),
  campaignController.create
);

router.put(
  "/:id",
  validateRequestBody(campaignSchemas.updateCampaignSchema),
  campaignController.update
);

router.delete("/:id", campaignController.remove);

export default router;
