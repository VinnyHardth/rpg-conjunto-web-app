import { useState, useCallback } from "react";
import type { Character } from "@/types/models";

interface UseSelectCharacterProps {
  isMaster: boolean;
  playerCharacterId: string | null;
  orderedCharacters: Character[];
}

export function useSelectCharacter({
  isMaster,
  playerCharacterId,
  orderedCharacters,
}: UseSelectCharacterProps) {
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null);

  const handleFocusCard = useCallback((characterId: string | null) => {
    // Permite focar, desfocar e trocar o foco
    setFocusedCardId((prev) => (prev === characterId ? null : characterId));
  }, []);

  const ensureAndGetFocus = useCallback(() => {
    let currentFocus = focusedCardId;

    if (!currentFocus) {
      const defaultFocusId = !isMaster
        ? playerCharacterId
        : orderedCharacters[0]?.id;
      if (defaultFocusId) {
        setFocusedCardId(defaultFocusId);
        currentFocus = defaultFocusId;
      }
    }
    return currentFocus;
  }, [focusedCardId, isMaster, playerCharacterId, orderedCharacters]);

  return {
    focusedCardId,
    handleFocusCard,
    ensureAndGetFocus,
  };
}
