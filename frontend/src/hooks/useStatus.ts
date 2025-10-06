// hooks/useStatus.ts
import { useEffect, useState } from "react";
import { Status } from "@/types/models";
import { fetchCharacterStatus } from "@/lib/api";

export const useStatus = (characterId: string) => {
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!characterId) return;

    fetchCharacterStatus(characterId)
      .then(setStatusList)
      .finally(() => setLoading(false));
  }, [characterId]);

  return { statusList, loading };
};
