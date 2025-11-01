import api from "./axios";
import type {
  User,
  Character,
  CharacterAttribute,
  Status,
  Attributes,
  CreateCharacter,
  Campaign,
  CreateCampaign,
  CampaignMember,
  CampaignMemberWithUser,
  CharacterPerCampaignWithCharacter,
  CreateCharacterPerCampaign,
} from "@/types/models";

import {
  CharacterHasItemDTO,
  SkillDTO,
  FullCharacterData,
  EffectDTO,
  CreateAppliedEffectDTO,
  AppliedEffectDTO,
  ItemsDTO,
  CreateCharacterHasItemDTO,
  UpdateCharacterHasItemDTO,
  CreateItemsDTO,
  UpdateItemsDTO,
  CreateItemHasEffectDTO,
  UpdateItemHasEffectDTO,
  ItemHasEffectDTO,
  CreateItemSkillsDTO,
  CreateEffectDTO,
  EffectModifierDTO,
  CreateEffectModifierDTO,
  UpdateEffectDTO,
  UpdateEffectModifierDTO,
  AbilitiesDTO,
  CreateAbilitiesDTO,
  UpdateAbilitiesDTO,
  AbilityEffectDTO,
  CreateAbilityEffectDTO,
  UpdateAbilityEffectDTO,
  AttributesDTO,
  StatusDTO,
} from "@rpg/shared";

import { Archetype } from "@/types/models";

export const fetchUser = async (): Promise<User> => {
  const { data } = await api.get("/auth/profile");
  return data;
};

// characters endpoint ---------------------------------------------------------

export const fetchCharacter = async (
  characterId: string,
): Promise<Character> => {
  const { data } = await api.get(`/characters/${characterId}`);
  return data;
};

export const fetchCharacterInventory = async (
  characterId: string,
): Promise<CharacterHasItemDTO[]> => {
  const { data } = await api.get(`/characterhasitems/character/${characterId}`);
  return data;
};

export const createCharacterInventoryItem = async (
  payload: CreateCharacterHasItemDTO,
): Promise<CharacterHasItemDTO> => {
  const { data } = await api.post("/characterhasitems", payload);
  return data;
};

export const updateCharacterInventoryItem = async (
  id: string,
  payload: UpdateCharacterHasItemDTO,
): Promise<CharacterHasItemDTO> => {
  const { data } = await api.put(`/characterhasitems/${id}`, payload);
  return data;
};

export const deleteCharacterInventoryItem = async (
  id: string,
): Promise<CharacterHasItemDTO> => {
  const { data } = await api.delete(`/characterhasitems/${id}`);
  return data;
};

export const fetchItems = async (): Promise<ItemsDTO[]> => {
  const { data } = await api.get("/items");
  return data;
};

export const createItem = async (
  payload: CreateItemsDTO,
): Promise<ItemsDTO> => {
  const { data } = await api.post("/items", payload);
  return data;
};

export const updateItem = async (
  id: string,
  payload: UpdateItemsDTO,
): Promise<ItemsDTO> => {
  const { data } = await api.put(`/items/${id}`, payload);
  return data;
};

export const deleteItem = async (id: string): Promise<void> => {
  await api.delete(`/items/${id}`);
};

export const createItemEffect = async (
  payload: CreateItemHasEffectDTO,
): Promise<void> => {
  await api.post("/itemhaseffects", payload);
};

export const fetchItemEffects = async (): Promise<ItemHasEffectDTO[]> => {
  const { data } = await api.get("/itemhaseffects");
  return data;
};

export const updateItemEffect = async (
  id: string,
  payload: UpdateItemHasEffectDTO,
): Promise<ItemHasEffectDTO> => {
  const { data } = await api.put(`/itemhaseffects/${id}`, payload);
  return data;
};

export const deleteItemEffect = async (id: string): Promise<void> => {
  await api.delete(`/itemhaseffects/${id}`);
};

export const createItemSkill = async (
  payload: CreateItemSkillsDTO,
): Promise<void> => {
  await api.post("/itemskills", payload);
};

export const fetchAttributesCatalog = async (): Promise<AttributesDTO[]> => {
  const { data } = await api.get("/attributes");
  return data;
};

export const fetchStatusCatalog = async (): Promise<StatusDTO[]> => {
  const { data } = await api.get("/status");
  return data;
};

// abilities ------------------------------------------------------------------

export const fetchAbilities = async (): Promise<AbilitiesDTO[]> => {
  const { data } = await api.get("/abilities");
  return data;
};

export const createAbility = async (
  payload: CreateAbilitiesDTO,
): Promise<AbilitiesDTO> => {
  const { data } = await api.post("/abilities", payload);
  return data;
};

export const updateAbility = async (
  id: string,
  payload: UpdateAbilitiesDTO,
): Promise<AbilitiesDTO> => {
  const { data } = await api.put(`/abilities/${id}`, payload);
  return data;
};

export const deleteAbility = async (id: string): Promise<void> => {
  await api.delete(`/abilities/${id}`);
};

export const fetchAbilityEffects = async (): Promise<AbilityEffectDTO[]> => {
  const { data } = await api.get("/abilityeffects");
  return data;
};

export const createAbilityEffect = async (
  payload: CreateAbilityEffectDTO,
): Promise<AbilityEffectDTO> => {
  const { data } = await api.post("/abilityeffects", payload);
  return data;
};

export const updateAbilityEffect = async (
  id: string,
  payload: UpdateAbilityEffectDTO,
): Promise<AbilityEffectDTO> => {
  const { data } = await api.put(`/abilityeffects/${id}`, payload);
  return data;
};

export const deleteAbilityEffect = async (id: string): Promise<void> => {
  await api.delete(`/abilityeffects/${id}`);
};

export const fetchCharacterSkills = async (
  characterId: string,
): Promise<SkillDTO[]> => {
  const { data } = await api.get(`/skills/character/${characterId}`);
  return data;
};

export const createCharacter = async (
  characterData: CreateCharacter,
): Promise<Character> => {
  const response = await api.post("/characters", characterData);
  return response.data;
};

export const fetchUserCharacters = async (
  userId: string,
): Promise<Character[]> => {
  const { data } = await api.get(`/characters/user/${userId}`);
  return data;
};

export const fetchCharacterAttributes = async (
  characterId: string,
): Promise<CharacterAttribute[]> => {
  const { data } = await api.get(
    `/characterattributes/character/${characterId}`,
  );
  return data;
};

export type UpdateCharacterAttributePayload = Partial<
  Pick<CharacterAttribute, "valueBase" | "valueInv" | "valueExtra">
> & {
  characterId?: string;
  attributeId?: string;
};

export const updateCharacterAttribute = async (
  characterAttributeId: string,
  payload: UpdateCharacterAttributePayload,
): Promise<CharacterAttribute> => {
  const { data } = await api.put(
    `/characterattributes/${characterAttributeId}`,
    payload,
  );
  return data;
};

export const fetchCharacterStatus = async (
  characterId: string,
): Promise<Status[]> => {
  const { data } = await api.get(`/status/character/${characterId}`);
  return data;
};

export type UpdateStatusPayload = Partial<
  Pick<
    Status,
    "characterId" | "name" | "valueMax" | "valueBonus" | "valueActual"
  >
>;

export const updateStatus = async (
  statusId: string,
  payload: UpdateStatusPayload,
): Promise<Status> => {
  const { data } = await api.put(`/status/${statusId}`, payload);
  return data;
};

export const fetchCharacterArchetypeData = async (
  archetypeId: string,
): Promise<Archetype> => {
  const { data } = await api.get(`/archetypes/${archetypeId}`);
  return data;
};

export const fetchArchetypes = async (): Promise<Archetype[]> => {
  const { data } = await api.get("/archetypes");
  return data;
};

export const fetchAttributeKinds = async (
  kind: string,
): Promise<Attributes[]> => {
  const { data } = await api.get("/attributes/kind/" + kind);
  return data;
};

export const fetchFullCharacter = async (
  characterId: string,
): Promise<FullCharacterData> => {
  const fullCharacter = await api.get(`/characters/full/${characterId}`);
  const character = fullCharacter.data.info;
  const attributes = fullCharacter.data.attributes;
  const status = fullCharacter.data.status;
  const inventory = fullCharacter.data.inventory;
  const skills = fullCharacter.data.skills;
  const archetype = fullCharacter.data.archetype;

  return {
    info: character,
    attributes,
    status,
    inventory,
    skills,
    archetype,
  };
};

// campaigns ------------------------------------------------------------------

export const fetchCampaignsByCreator = async (
  creatorId: string,
): Promise<Campaign[]> => {
  const { data } = await api.get(`/campaigns/creator/${creatorId}`);
  return data;
};

export const createCampaign = async (
  payload: CreateCampaign,
): Promise<Campaign> => {
  const { data } = await api.post("/campaigns", payload);
  return data;
};

export const addCampaignMember = async (
  payload: Omit<CampaignMember, "id" | "createdAt" | "updatedAt" | "deletedAt">,
): Promise<CampaignMember> => {
  const { data } = await api.post("/campaignmembers", payload);
  return data;
};

export const fetchCampaignById = async (
  campaignId: string,
): Promise<Campaign> => {
  const { data } = await api.get(`/campaigns/${campaignId}`);
  return data;
};

export const fetchCampaignMembersByUser = async (
  userId: string,
): Promise<CampaignMember[]> => {
  const { data } = await api.get(`/campaignmembers/user/${userId}`);
  return data;
};

export const fetchCampaignMembersByCampaign = async (
  campaignId: string,
): Promise<CampaignMemberWithUser[]> => {
  const { data } = await api.get(`/campaignmembers/campaign/${campaignId}`);
  return data;
};

export const fetchUserByEmail = async (email: string): Promise<User> => {
  const encoded = encodeURIComponent(email);
  const { data } = await api.get(`/users/email/${encoded}`);
  return data;
};

export const fetchUserById = async (userId: string): Promise<User> => {
  const { data } = await api.get(`/users/${userId}`);
  return data;
};

export const fetchCampaignCharacters = async (
  campaignId: string,
): Promise<CharacterPerCampaignWithCharacter[]> => {
  const { data } = await api.get(
    `/characterpercampaigns/campaign/${campaignId}`,
  );
  return data;
};

export const addCharacterToCampaign = async (
  payload: CreateCharacterPerCampaign,
): Promise<CharacterPerCampaignWithCharacter> => {
  const { data } = await api.post("/characterpercampaigns", payload);
  return data;
};

export const removeCharacterFromCampaign = async (
  relationId: string,
): Promise<CharacterPerCampaignWithCharacter> => {
  const { data } = await api.delete(`/characterpercampaigns/${relationId}`);
  return data;
};

export interface RollDifficultyPayload {
  campaignId: string;
  characterId: string;
  attributeName: string;
  attributeAbbreviation: string;
  attributeValue: number;
  expertiseName?: string | null;
  expertiseValue?: number | null;
  miscBonus?: number | null;
}

export interface RollDifficultyResponse {
  campaignId: string;
  characterId: string;
  attributeName: string;
  attributeAbbreviation: string;
  attributeValue: number;
  expertiseName: string | null;
  expertiseValue: number;
  miscBonus: number;
  baseRoll: number;
  modifiersTotal: number;
  modifiers: {
    attribute: number;
    expertise: number;
    misc: number;
  };
  expression: string;
  renderedExpression: string;
  total: number;
  successes: number;
  failures: number;
  rolls: number[];
}

export const rollDifficulty = async (
  payload: RollDifficultyPayload,
): Promise<RollDifficultyResponse> => {
  const { data } = await api.post("/dice/difficulty", payload);
  return data;
};

export interface RollCustomResponse {
  expression: string;
  renderedExpression: string;
  total: number;
  successes: number;
  failures: number;
  rolls: number[];
}

export const rollCustom = async (
  expression: string,
): Promise<RollCustomResponse> => {
  const { data } = await api.post("/dice/custom", { expression });
  return data;
};

export const clearDiceRolls = async (campaignId: string): Promise<void> => {
  await api.post("/dice/clear", { campaignId });
};

// effects --------------------------------------------------------------------

export const fetchEffects = async (): Promise<EffectDTO[]> => {
  const { data } = await api.get("/effects");
  return data;
};

export const createEffect = async (
  payload: CreateEffectDTO,
): Promise<EffectDTO> => {
  const { data } = await api.post("/effects", payload);
  return data;
};

export const updateEffect = async (
  id: string,
  payload: UpdateEffectDTO,
): Promise<EffectDTO> => {
  const { data } = await api.put(`/effects/${id}`, payload);
  return data;
};

export const deleteEffect = async (id: string): Promise<void> => {
  await api.delete(`/effects/${id}`);
};

export const fetchEffectModifiers = async (): Promise<EffectModifierDTO[]> => {
  const { data } = await api.get("/effectmodifiers");
  return data;
};

export const createEffectModifier = async (
  payload: CreateEffectModifierDTO,
): Promise<EffectModifierDTO> => {
  const { data } = await api.post("/effectmodifiers", payload);
  return data;
};

export const updateEffectModifier = async (
  id: string,
  payload: UpdateEffectModifierDTO,
): Promise<EffectModifierDTO> => {
  const { data } = await api.put(`/effectmodifiers/${id}`, payload);
  return data;
};

export const deleteEffectModifier = async (id: string): Promise<void> => {
  await api.delete(`/effectmodifiers/${id}`);
};

export const createAppliedEffect = async (
  payload: CreateAppliedEffectDTO,
): Promise<AppliedEffectDTO> => {
  const { data } = await api.post("/appliedeffects", payload);
  return data;
};

export interface ApplyEffectTurnPayload {
  characterId: string;
  effectId: string;
  sourceType: string;
  sourceId?: string;
  duration: number;
  valuePerStack?: number;
  stacksDelta?: number;
  currentTurn?: number;
}

/**
 * Aplica um efeito em um personagem (dano, cura, buff, etc).
 * Corresponde à rota POST /applied-effects/turn
 */
export const applyEffectTurn = async (payload: ApplyEffectTurnPayload) => {
  const { data } = await api.post("/appliedeffects/turn", payload);
  return data;
};

export type StatusUpdateItem = {
  statusId: string;
} & UpdateStatusPayload;

export const updateMultipleStatuses = async (
  payload: StatusUpdateItem[],
): Promise<Status[]> => {
  if (payload.length === 0) return [];

  // Executa todas as atualizações em paralelo
  await Promise.all(
    payload.map((status) =>
      updateStatus(status.statusId, {
        characterId: status.characterId,
        name: status.name,
        valueMax: status.valueMax,
        valueBonus: status.valueBonus,
        valueActual: status.valueActual,
      }).catch((err) => {
        console.error(`Erro ao atualizar status ${status.statusId}:`, err);
        return null; // ignora falha individual
      }),
    ),
  );
  // Busca novamente o estado atualizado do personagem
  const { data } = await api.get(`/status/character/${payload[0].characterId}`);
  console.log("Statuses atualizados:", data);
  return data;
};
