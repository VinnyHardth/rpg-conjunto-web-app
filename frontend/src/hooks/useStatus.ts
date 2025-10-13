// hooks/useStatus.ts
import useSWR from "swr";
import { Status } from "@/types/models";
import { fetchCharacterStatus } from "@/lib/api";

export const statusCacheKey = (characterId?: string | null): string | null =>
  characterId ? `character-status-${characterId}` : null;

export const useStatus = (characterId: string | null) => {
  const shouldFetch = Boolean(characterId);
  const { data, isLoading, mutate } = useSWR<Status[]>(
    shouldFetch ? statusCacheKey(characterId) : null,
    () => fetchCharacterStatus(characterId!),
    { revalidateOnFocus: false },
  );

  return {
    statusList: data ?? [],
    loading: isLoading,
    mutateStatus: mutate,
  };
};
