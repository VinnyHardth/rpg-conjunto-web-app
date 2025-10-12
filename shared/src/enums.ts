export const CostType = {
  MP: "MP",
  TP: "TP",
  HP: "HP",
  COMBINATION: "COMBINATION",
  NONE: "NONE",
} as const;
export type CostType = (typeof CostType)[keyof typeof CostType];

export const SkillUseType = {
  PASSIVE: "PASSIVE",
  ACTIVE: "ACTIVE",
} as const;
export type SkillUseType = (typeof SkillUseType)[keyof typeof SkillUseType];

export const SourceType = {
  ITEM: "ITEM",
  SKILL: "SKILL",
  OTHER: "OTHER",
} as const;
export type SourceType = (typeof SourceType)[keyof typeof SourceType];

export const DamageType = {
  TRUE: "TRUE",
  PHISICAL: "PHISICAL",
  MAGIC: "MAGIC",
  NONE: "NONE",
} as const;
export type DamageType = (typeof DamageType)[keyof typeof DamageType];

export const StackingPolicy = {
  REFRESH: "REFRESH",
  REPLACE: "REPLACE",
  STACK: "STACK",
  NONE: "NONE",
} as const;
export type StackingPolicy =
  (typeof StackingPolicy)[keyof typeof StackingPolicy];

export const EquipSlot = {
  HEAD: "HEAD",
  CHEST: "CHEST",
  LEGS: "LEGS",
  HAND: "HAND",
  OFFHAND: "OFFHAND",
  RING1: "RING1",
  RING2: "RING2",
  NONE: "NONE",
} as const;
export type EquipSlot = (typeof EquipSlot)[keyof typeof EquipSlot];

export const AttributeKind = {
  ATTRIBUTE: "ATTRIBUTE",
  EXPERTISE: "EXPERTISE",
} as const;
export type AttributeKind =
  (typeof AttributeKind)[keyof typeof AttributeKind];

export const ItemType = {
  CONSUMABLE: "CONSUMABLE",
  EQUIPPABLE: "EQUIPPABLE",
  MATERIAL: "MATERIAL",
  QUEST: "QUEST",
  MISC: "MISC",
} as const;
export type ItemType = (typeof ItemType)[keyof typeof ItemType];

export const CharacterType = {
  NPC: "NPC",
  PC: "PC",
  DEAD: "DEAD",
  RETIRE: "RETIRE",
} as const;
export type CharacterType = (typeof CharacterType)[keyof typeof CharacterType];

export const ComponentType = {
  STATUS: "STATUS",
  ATTRIBUTE: "ATTRIBUTE",
  SLOT: "SLOT",
  TAG: "TAG",
  NONE: "NONE",
} as const;
export type ComponentType =
  (typeof ComponentType)[keyof typeof ComponentType];

export const OperationType = {
  ADD: "ADD",
  MULT: "MULT",
  SET: "SET",
  TOGGLE: "TOGGLE",
  OVERRIDE: "OVERRIDE",
  DICE: "DICE",
} as const;
export type OperationType =
  (typeof OperationType)[keyof typeof OperationType];
