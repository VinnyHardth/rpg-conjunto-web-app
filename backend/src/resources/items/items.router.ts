import { Router } from "express";
import validateRequestBody from "../../middlewares/validateRequestBody";
import itemsController from "./items.controllers";
import * as itemsSchemas from "./items.schemas";

const router = Router();

// read methods ---------------------------------------------------------------
router.get("/", itemsController.getAll);
router.get("/:id", itemsController.getById);

// write methods --------------------------------------------------------------
router.post(
  "/",
  validateRequestBody(itemsSchemas.createItemsSchema),
  itemsController.create,
);
router.put(
  "/:id",
  validateRequestBody(itemsSchemas.updateItemsSchema),
  itemsController.update,
);

// delete methods -------------------------------------------------------------
router.delete("/:id", itemsController.remove);

export default router;
