import { useState, useMemo, useCallback, useEffect } from "react";
import { clearDiceRolls, type RollDifficultyResponse } from "@/lib/api";
import type { Character } from "@/types/models";

interface UseDiceRollsProps {
  campaignId: string | null;
  isMaster: boolean;
  orderedCharacters: Character[];
}

export function useDiceRolls({
  campaignId,
  isMaster,
  orderedCharacters,
}: UseDiceRollsProps) {
  const [rollsByCharacter, setRollsByCharacter] = useState<
    Record<string, RollDifficultyResponse>
  >({});
  const [rollError, setRollError] = useState<string | null>(null);

  const activeRollEntries = useMemo(() => {
    return orderedCharacters
      .map((character) => {
        const roll = rollsByCharacter[character.id];
        if (!roll) return null;
        return { character, roll };
      })
      .filter(
        (
          entry,
        ): entry is { character: Character; roll: RollDifficultyResponse } =>
          entry !== null,
      );
  }, [orderedCharacters, rollsByCharacter]);

  const handleClearRolls = useCallback(async () => {
    if (!isMaster || !campaignId || activeRollEntries.length === 0) return;
    try {
      await clearDiceRolls(campaignId);
      setRollsByCharacter({});
      setRollError(null);
    } catch (error) {
      console.error("Falha ao limpar rolagens:", error);
      setRollError("Não foi possível limpar as rolagens agora.");
    }
  }, [isMaster, campaignId, activeRollEntries.length]);

  const handleDiceRolled = useCallback(
    (payload: RollDifficultyResponse) => {
      if (payload.campaignId !== campaignId) return;
      setRollsByCharacter((prev) => ({
        ...prev,
        [payload.characterId]: payload,
      }));
      setRollError(null);
    },
    [campaignId],
  );

  const handleDiceCleared = useCallback(
    ({ campaignId: clearedCampaignId }: { campaignId: string }) => {
      if (clearedCampaignId !== campaignId) return;
      setRollsByCharacter({});
    },
    [campaignId],
  );

  // Limpa rolagens de personagens que não estão mais na campanha
  useEffect(() => {
    if (!orderedCharacters) return;
    const activeCharacterIds = new Set(
      orderedCharacters.map((char) => char.id),
    );
    setRollsByCharacter((prev) => {
      let changed = false;
      const next: Record<string, RollDifficultyResponse> = {};
      Object.entries(prev).forEach(([characterId, roll]) => {
        if (activeCharacterIds.has(characterId)) {
          next[characterId] = roll;
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [orderedCharacters]);

  const handleCharacterUnlinked = useCallback(
    (payload: { characterId?: string }) => {
      const characterId = payload.characterId;
      if (!characterId) return;
      setRollsByCharacter((prev) => {
        if (!(characterId in prev)) return prev;
        const next = { ...prev };
        delete next[characterId];
        return next;
      });
    },
    [],
  );

  const socketHandlers = useMemo(
    () => ({
      onDiceRolled: handleDiceRolled,
      onDiceCleared: handleDiceCleared,
      onCharacterUnlinked: handleCharacterUnlinked,
    }),
    [handleDiceRolled, handleDiceCleared, handleCharacterUnlinked],
  );

  return {
    rollsByCharacter,
    setRollsByCharacter,
    rollError,
    activeRollEntries,
    handleClearRolls,
    /**
     * Objeto estável contendo os handlers de socket para este hook.
     */
    socketHandlers,
  };
}
