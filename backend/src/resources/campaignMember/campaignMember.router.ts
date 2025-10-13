import { Router } from "express";

import validateRequestBody from "../../middlewares/validateRequestBody";
import controller from "./campaignMember.controller";
import * as schemas from "./campaignMember.schemas";

const router = Router();

router.get("/", controller.getAll);
router.get("/campaign/:campaignId", controller.getByCampaignId);
router.get("/user/:userId", controller.getByUserId);
router.get("/:id", controller.getById);

router.post(
  "/",
  validateRequestBody(schemas.createCampaignMemberSchema),
  controller.create,
);

router.put(
  "/:id",
  validateRequestBody(schemas.updateCampaignMemberSchema),
  controller.update,
);

router.delete("/:id", controller.remove);

export default router;
