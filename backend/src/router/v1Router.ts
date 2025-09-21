import { Router } from "express";

import userRouter from "../resources/user/user.router";

import archetypeRouter from "../resources/archetype/archetype.router";

import characterRouter from "../resources/character/character.router";
import characterAttributeRouter from "../resources/characterAttribute/characterAttribute.router";
import characterHasItemRouter from "../resources/characterHasItem/characterHasItem.router";

import abilitiesRouter from "../resources/abilities/abilities.router";
import abilityEffectRouter from "../resources/abilityEffect/abilityEffect.router";
import skillRouter from "../resources/skill/skill.router";

import attributeRouter from "../resources/attributes/attributes.router";
import statusRouter from "../resources/status/status.router";

import effectRouter from "../resources/effect/effect.router";
import effecttargetRouter from "../resources/effectTarget/effectTarget.router";
import appliedEffectRouter from "../resources/appliedEffect/appliedEffect.router";

import itemsRouter from "../resources/items/items.router";
import itemSkillsRouter from "../resources/itemSkills/itemSkills.router";
import itemHasEffectRouter from "../resources/itemHasEffect/itemHasEffect.router";

const router = Router();

router.use(
    "/users",
    // #swagger.tags = ['Users']
     userRouter);

router.use(
    "/archetypes",
    // #swagger.tags = ['Archetypes']
    archetypeRouter);

router.use(
    "/characters",
    // #swagger.tags = ['Characters']
    characterRouter);

router.use(
    "/characterattributes",
    // #swagger.tags = ['CharacterAttributes']
    characterAttributeRouter);

router.use(
    "/characterhasitems",
    // #swagger.tags = ['CharacterHasItems']
    characterHasItemRouter
)

router.use(
    "/abilities",
    // #swagger.tags = ['Abilities']
    abilitiesRouter);

router.use(
    "/abilityeffects",
    // #swagger.tags = ['AbilityEffects']
    abilityEffectRouter);

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
    "/appliedeffects",
    // #swagger.tags = ['AppliedEffects']
    appliedEffectRouter);

router.use(
    "/items",
    // #swagger.tags = ['Items']
    itemsRouter);

router.use(
    "/itemskills",
    // #swagger.tags = ['ItemSkills']
    itemSkillsRouter);

router.use(
    "/itemhaseffects",
    // #swagger.tags = ['ItemHasEffects']
    itemHasEffectRouter);

router.use(
    "/skills",
    // #swagger.tags = ['Skills']
    skillRouter);

router.use(
    "/status",
    // #swagger.tags = ['Status']
    statusRouter);


export default router;