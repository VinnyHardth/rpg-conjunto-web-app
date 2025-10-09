import { Router } from "express";
import { isAuthenticated } from "../../middlewares/isAuthenticated";

import authController from "./auth.controller";

const router = Router();

// read methods ---------------------------------------------------------------
router.get("/profile", authController.getProfile);

// write methods --------------------------------------------------------------
router.post("/register", authController.register);
router.put("/login", authController.login);

// delete methods -------------------------------------------------------------
router.delete("/logout", isAuthenticated, authController.logout);

export default router;
