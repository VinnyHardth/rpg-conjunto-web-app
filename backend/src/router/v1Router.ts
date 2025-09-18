import { Router } from "express";

import userRouter from "../resources/user/user.router";
import characterRouter from "../resources/character/character.router";
import archetypeRouter from "../resources/archetype/archetype.router";
import abilitiesRouter from "../resources/abilities/abilities.router";
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

router.use(
    "/abilities",
    // #swagger.tags = ['Abilities']
    abilitiesRouter);


export default router;