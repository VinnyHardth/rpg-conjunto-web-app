import api from "./axios";
import { User, Character, CharacterAttribute, Status, Attributes } from "@/types/models";

import { Archetype } from "@/types/models";

export const fetchUser = async (): Promise<User> => {
  const { data } = await api.get("/auth/profile");
  return data;
};

// characters endpoint ---------------------------------------------------------

export const fetchCharacter = async (characterId: string): Promise<Character> => {
  const { data } = await api.get(`/characters/${characterId}`);
  return data;
}

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

export const fetchCharacterArchetype = async (characterId: string): Promise<Archetype> => {
  const { data } = await api.get(`/archetypes/character/${characterId}`);
  return data;
}

export const fetchArchetypes = async (): Promise<Archetype[]> => {
  const { data } = await api.get("/archetypes");
  return data;
};

export const fetchAttributeKinds = async (kind: string): Promise<Attributes[]> => {
  const { data } = await api.get("/attributes/kind/" + kind);
  return data;
}

export type FullCharacter = Character & {
  attributes: CharacterAttribute[];
  status: Status[];
  archetype: Archetype;
};

export const fetchAllCharacterData = async (characterId: string): Promise<FullCharacter> => {
  const [character, attributes, status, archetype] = await Promise.all([
    fetchCharacter(characterId),
    fetchCharacterAttributes(characterId),
    fetchCharacterStatus(characterId),
    fetchCharacterArchetype(characterId),
  ]);
  return { ...character, attributes, status, archetype };
};
