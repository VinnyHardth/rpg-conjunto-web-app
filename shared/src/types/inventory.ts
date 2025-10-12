import type { DateTime } from "./common";
import type { ItemType, EquipSlot } from "../enums";

export interface ItemsDTO {
  id: string;
  name: string;
  description: string | null;
  imageURL: string | null;
  value: number;
  itemType: ItemType;
  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt: DateTime | null;
}

export interface CreateItemsDTO {
  name: string;
  description?: string | null;
  imageURL?: string | null;
  value?: number;
  itemType?: ItemType;
}

export type UpdateItemsDTO = Partial<CreateItemsDTO>;

export interface DeleteItemsDTO {
  id: string;
}

export interface CharacterHasItemDTO {
  id: string;
  characterId: string;
  itemId: string;
  quantity: number;
  value: number | null;
  is_equipped: boolean;
  equipped_slot: EquipSlot;
  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt: DateTime | null;
}

export interface CreateCharacterHasItemDTO {
  characterId: string;
  itemId: string;
  quantity?: number;
  value?: number | null;
  is_equipped?: boolean;
  equipped_slot?: EquipSlot;
}

export type UpdateCharacterHasItemDTO = Partial<CreateCharacterHasItemDTO>;

export interface DeleteCharacterHasItemDTO {
  id: string;
}

export interface ItemHasEffectDTO {
  id: string;
  itemId: string;
  effectsId: string;
  formula: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt: DateTime | null;
}

export interface CreateItemHasEffectDTO {
  effectsId: string;
  itemId: string;
  formula: string;
}

export type UpdateItemHasEffectDTO = Partial<CreateItemHasEffectDTO>;

export interface DeleteItemHasEffectDTO {
  id: string;
}

export interface ItemSkillsDTO {
  id: string;
  abilityId: string;
  itemId: string;
  cooldown: number;
  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt: DateTime | null;
}

export interface CreateItemSkillsDTO {
  abilityId: string;
  itemId: string;
  cooldown?: number;
}

export type UpdateItemSkillsDTO = Partial<CreateItemSkillsDTO>;

export interface DeleteItemSkillsDTO {
  id: string;
}
