import { Router } from "express";

import userRouter from "../resources/user/user.router";
import characterRouter from "../resources/character/character.router";
import statsRouter from "../resources/stats/stats.router";
import charStateRouter from "../resources/charState/charState.router";

const router = Router();

router.use(
    "/users",
    // #swagger.tags = ['Users']
     userRouter);

router.use(
    "/characters",
    // #swagger.tags = ['Characters']
    characterRouter);

router.use(
    "/stats",
    // #swagger.tags = ['Stats']
    statsRouter);

router.use(
    "/char-states",
    // #swagger.tags = ['Character States']
    charStateRouter);

export default router;