import useSWR from "swr";
import api from "@/lib/axios";
import type { FullCharacterData } from "@rpg/shared";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export const useCharacterData = (characterId?: string) => {
  // 🔸 Só faz a request se houver um ID válido
  const shouldFetch = Boolean(characterId);

  const { data, error, isLoading, mutate, isValidating } =
    useSWR<FullCharacterData>(
      shouldFetch ? `/characters/full/${characterId}` : null,
      fetcher,
      {
        revalidateOnFocus: false, // evita requisições ao focar na aba
        shouldRetryOnError: false, // evita loop em erros
        dedupingInterval: 10_000, // evita refetchs repetidos em menos de 10s
      },
    );

  return {
    data,
    isLoading: isLoading || (shouldFetch && !data && !error),
    error,
    mutate,
    isValidating,
    hasError: Boolean(error),
    isEmpty: !data && !error && !isLoading,
  };
};
