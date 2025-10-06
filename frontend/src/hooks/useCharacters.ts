import { useEffect, useState } from "react";
import { fetchUserCharacters } from "@/lib/api";
import { Character } from "@/types/models";

// 1. O tipo de retorno do hook agora inclui 'loading' e 'error'
type UseCharactersResult = {
  characters: Character[];
  loading: boolean;
  error: Error | null;
};

export function useCharacters(userId?: string): UseCharactersResult {
  const [characters, setCharacters] = useState<Character[]>([]);
  // 2. Adicionar o estado de loading e inicializá-lo como true
  const [loading, setLoading] = useState(true);
  // 3. Adicionar o estado de erro
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Se não há userId, paramos a execução mas já sabemos que não estamos carregando nada
    if (!userId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true); // 4. Começa a carregar
    setError(null);

    fetchUserCharacters(userId)
      .then((data) => {
        if (isMounted) {
          setCharacters(data);
          setLoading(false); // 5. Termina de carregar
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Erro ao buscar personagens:", err);
          setError(err as Error);
          setLoading(false); // 6. Termina de carregar mesmo em caso de erro
        }
      });

    return () => { isMounted = false };
  }, [userId]);

  // 7. Retornar todos os estados
  return { characters, loading, error };
}