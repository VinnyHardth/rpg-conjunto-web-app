import { useEffect, useState } from "react";
import { fetchUserCharacters } from "@/lib/api";
import { Character } from "@/types/models";

export function useCharacters(userId?: string) {
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    fetchUserCharacters(userId)
      .then((data) => isMounted && setCharacters(data))
      .catch(console.error);

    return () => { isMounted = false };
  }, [userId]);

  return { characters };
}
