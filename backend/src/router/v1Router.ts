import { Router } from "express";

import userRouter from "../resources/user/user.router";
import characterRouter from "../resources/character/character.router";
import characterattributeRouter from "../resources/characterAttribute/characterAttribute.router";
import archetypeRouter from "../resources/archetype/archetype.router";
import abilitiesRouter from "../resources/abilities/abilities.router";
import attributeRouter from "../resources/attributes/attributes.router";
import effectRouter from "../resources/effect/effect.router";
import effecttargetRouter from "../resources/effectTarget/effectTarget.router";
import itemsRouter from "../resources/items/items.router";
import skillRouter from "../resources/skill/skill.router";

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
    "/characterattributes",
    // #swagger.tags = ['CharacterAttributes']
    characterattributeRouter);

router.use(
    "/archetypes",
    // #swagger.tags = ['Archetypes']
    archetypeRouter);

router.use(
    "/abilities",
    // #swagger.tags = ['Abilities']
    abilitiesRouter);

router.use(
    "/attributes",
    // #swagger.tags = ['Attributes']
    attributeRouter);

router.use(
    "/effects",
    // #swagger.tags = ['Effects']
    effectRouter);

router.use(
    "/effecttargets",
    // #swagger.tags = ['EffectTargets']
    effecttargetRouter);

router.use(
    "/items",
    // #swagger.tags = ['Items']
    itemsRouter);

router.use(
    "/skills",
    // #swagger.tags = ['Skills']
    skillRouter);


export default router;