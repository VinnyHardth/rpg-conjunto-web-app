import api from "./axios";
import { User, Character, CharacterAttribute, Status } from "@/types/models";

import { Archetype } from "@/types/models";

export const fetchUser = async (): Promise<User> => {
  const { data } = await api.get("/auth/profile");
  return data;
};

export const fetchUserCharacters = async (userId: string): Promise<Character[]> => {
  const { data } = await api.get(`/characters/user/${userId}`);
  return data;
};

export const fetchCharacterAttributes = async (characterId: string): Promise<CharacterAttribute[]> => {
  const { data } = await api.get(`/character-attributes/character/${characterId}`);
  return data;
};

export const fetchCharacterStatus = async (characterId: string): Promise<Status[]> => {
  const { data } = await api.get(`/status/character/${characterId}`);
  return data;
};

export const fetchArchetypes = async (): Promise<Archetype[]> => {
  const { data } = await api.get("/archetypes");
  return data;
};