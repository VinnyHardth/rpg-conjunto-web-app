import useSWR from 'swr';
import { fetchUserCharacters, createCharacter } from "@/lib/api";
import { Character, CreateCharacter } from "@/types/models";
import api from '@/lib/axios';

// Tipo estendido para o cache com status
interface CharacterWithStats extends Character {
  hp?: number;
  mp?: number;
  tp?: number;
  movimento?: number;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useCharacters(userId?: string) {
  const { data, error, isLoading, mutate } = useSWR<Character[]>(
    userId ? `/characters/user/${userId}` : null,
    fetcher
  );

  const addCharacter = async (
    characterData: CreateCharacter,
    derivedStats?: { hp: number; mp: number; tp: number; movimento: number } // ← Adicione esta parameter
  ): Promise<Character> => {
    const newCharacter = await createCharacter(characterData);
    
    // Se temos derivedStats, enriquecemos o personagem para o cache
    const characterForCache: CharacterWithStats = derivedStats ? {
      ...newCharacter,
      hp: derivedStats.hp,
      mp: derivedStats.mp,
      tp: derivedStats.tp,
      movimento: derivedStats.movimento,
    } : newCharacter;
    
    // Atualização otimista
    mutate([characterForCache, ...(data || [])], false);
    
    return characterForCache;
  };

  const refreshCharacters = async () => {
    mutate();
  };

  return {
    characters: data || [],
    loading: isLoading,
    error: error as Error | null,
    addCharacter,
    refreshCharacters,
  };
}