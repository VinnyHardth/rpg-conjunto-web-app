import { Router } from "express";

import validateRequestBody from "../../middlewares/validateRequestBody";
import userController from "./user.controller";
import * as userSchemas from "./user.schemas";

const router = Router();

// read methods ---------------------------------------------------------------
router.get("/", userController.getAll);
router.get("/:id", userController.getById);
router.get("/email/:email", userController.getByEmail);

// write methods ---------------------------------------------------------------
router.post(
  "/",
  validateRequestBody(userSchemas.createUserSchema),
  userController.create
);
router.put(
  "/:id",
  validateRequestBody(userSchemas.updateUserSchema),
  userController.update
);

// delete methods -------------------------------------------------------------
router.delete("/:id", userController.remove);

export default router;
