import { Router } from "express";

import userRouter from "../resources/user/user.router";
import characterRouter from "../resources/character/character.router";
import archetypeRouter from "../resources/archetype/archetype.routes";

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
    "/archetypes",
    // #swagger.tags = ['Archetypes']
    archetypeRouter);


export default router;