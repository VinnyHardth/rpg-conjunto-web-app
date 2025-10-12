// Backend DTOs
import { UserDTO } from "@/../../backend/src/resources/user/user.types";
import { LoginUserDTO } from "@/../../backend/src/resources/auth/auth.types";
import { CharacterDTO, CreateCharacterDTO } from "@/../../backend/src/resources/character/character.types";
import { CharacterAttributeDTO, CreateCharacterAttributeDTO } from "@/../../backend/src/resources/characterAttribute/characterAttribute.types";
import { StatusDTO, CreateStatusDTO } from "@/../../backend/src/resources/status/status.types";
import { ArchetypeDTO } from "@/../../backend/src/resources/archetype/archetype.types";
import { AttributesDTO } from "@/../../backend/src/resources/attributes/attributes.types";
import { CharacterHasItemDTO } from "@/../../backend/src/resources/characterHasItem/characterHasItem.types";
import { CreateSkillDTO, SkillDTO } from "@/../../backend/src/resources/skill/skill.types";
import { CreateAbilitiesDTO, AbilitiesDTO } from "@/../../backend/src/resources/abilities/abilities.types";

import Decimal from "decimal.js";

// Frontend types
export interface CreateFullCharacter {
    info: CreateCharacterDTO;
    attributes: CreateCharacterAttributeDTO[];
    expertises: CreateCharacterAttributeDTO[];
    status: CreateStatusDTO[];
    archetype: ArchetypeDTO;
}

export interface FullCharacterData {
    info: CharacterDTO;
    archetype: ArchetypeDTO | null;
    attributes: CharacterAttributeDTO[];
    status: StatusDTO[];
    inventory: CharacterHasItemDTO[];
    skills: SkillDTO[];
}

// Aliases for cleaner usage
export type User = UserDTO;
export type LoginUser = LoginUserDTO;
export type Character = CharacterDTO;
export type CreateCharacter = CreateCharacterDTO & {
  initialHp?: number;
  initialMp?: number;
  initialTp?: number;
};

export type CharacterAttribute = CharacterAttributeDTO;
export type CreateCharacterAttribute = CreateCharacterAttributeDTO;
export type Status = StatusDTO;
export type Attributes = AttributesDTO;
export type Archetype = ArchetypeDTO;
export type abilities = AbilitiesDTO;
export type CharacterHasItem = CharacterHasItemDTO;
export type CreateSkill = CreateSkillDTO;
export type Skill = SkillDTO;
export type CreateAbilities = CreateAbilitiesDTO;

// Enums from Prisma schema (para uso no frontend)
export enum CostType { 
  MP = "MP",
  TP = "TP",
  HP = "HP",
  COMBINATION = "COMBINATION",
  NONE = "NONE"
}

export enum SkillUseType { 
  PASSIVE = "PASSIVE",
  ACTIVE = "ACTIVE"
}

export enum SourceType { 
  ITEM = "ITEM",
  SKILL = "SKILL",
  OTHER = "OTHER"
}

export enum DamageType {
  TRUE = "TRUE",
  PHISICAL = "PHISICAL",
  MAGIC = "MAGIC",
  NONE = "NONE"
}

export enum StackingPolicy {
  REFRESH = "REFRESH",
  REPLACE = "REPLACE",
  STACK = "STACK",
  NONE = "NONE"
}

export enum EquipSlot { 
  HEAD = "HEAD",
  CHEST = "CHEST",
  LEGS = "LEGS",
  HAND = "HAND",
  OFFHAND = "OFFHAND",
  RING1 = "RING1",
  RING2 = "RING2",
  NONE = "NONE"
}

export enum AttributeKind {
  ATTRIBUTE = "ATTRIBUTE",
  EXPERTISE = "EXPERTISE"
}

export enum ItemType {
  CONSUMABLE = "CONSUMABLE",
  EQUIPPABLE = "EQUIPPABLE",
  MATERIAL = "MATERIAL",
  QUEST = "QUEST",
  MISC = "MISC"
}

export enum CharacterType {
  NPC = "NPC",
  PC = "PC",
  DEAD = "DEAD",
  RETIRE = "RETIRE"
}

export enum ComponentType {
  STATUS = "STATUS",
  ATTRIBUTE = "ATTRIBUTE",
  SLOT = "SLOT",
  TAG = "TAG",
  NONE = "NONE"
}

export enum OperationType {
  ADD = "ADD",
  MULT = "MULT",
  SET = "SET",
  TOGGLE = "TOGGLE",
  OVERRIDE = "OVERRIDE",
  DICE = "DICE"
}

export type AttributeKey = 
  | "Strength" | "Dexterity" | "Intelligence" | "Wisdom" 
  | "Constitution" | "Charisma" | "Destiny";

export const GENEROS_MOCK = ["Masculino", "Feminino", "Não Binário", "Outro"];
export const STEPS_NAMES = ["Informações Básicas", "Atributos & Estatísticas", "Resumo Final"];

// Tipos para atualizações
export type CharacterBasicInfoUpdate = {
  name?: string;
  race?: string ;
  age?: number ;
  height?: number ;
  gender?: string;
  money?: Decimal;
  annotations?: string ;
  generation?: number;
  type?: CharacterType;
  archetypeId?: string;
  imageUrl?: string;
};
export interface CharacterAttributeUpdate {
  id: string;
  valueBase?: number;
  valueInv?: number;
  docExtra?: number;
}

export interface StatusUpdate {
  id: string;
  valueMax?: number;
  valueBonus?: number;
  valueActual?: number;
}

export interface SkillUpdate {
  id: string;
  cooldown?: number;
  useType?: SkillUseType;
}

export interface InventoryUpdate {
  id: string;
  quantity?: number;
  is_equipped?: boolean;
  equipped_slot?: EquipSlot;
}

// Tipo para atualizações parciais do FullCharacterData
export type PartialFullCharacterData = {
  [K in keyof FullCharacterData]?: Partial<FullCharacterData[K]>;
};