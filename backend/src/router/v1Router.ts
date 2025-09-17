import { Router } from "express";

import userRouter from "../resources/user/user.router";

const router = Router();

router.use(
    "/users",
    // #swagger.tags = ['Users']
     userRouter);

export default router;