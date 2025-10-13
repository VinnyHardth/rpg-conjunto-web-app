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

import { CharacterHasItemDTO, SkillDTO, FullCharacterData } from "@rpg/shared";

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

export const fetchCharacterStatus = async (
  characterId: string,
): Promise<Status[]> => {
  const { data } = await api.get(`/status/character/${characterId}`);
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
