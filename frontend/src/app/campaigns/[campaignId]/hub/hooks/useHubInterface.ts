import { useState, useRef, useEffect, useCallback } from "react";
import type { Character } from "@/types/models";

interface UseHubInterfaceProps {
  isMaster: boolean;
  playerCharacterId: string | null;
  orderedCharacters: Character[];
  disableSelection: boolean;
}

export function useHubInterface({
  isMaster,
  playerCharacterId,
  orderedCharacters,
  disableSelection,
}: UseHubInterfaceProps) {
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null);
  const [isAttributesOpen, setAttributesOpen] = useState(false);
  const [isDamageOpen, setDamageOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const attributesButtonRef = useRef<HTMLButtonElement | null>(null);
  const attributesPanelRef = useRef<HTMLDivElement | null>(null);
  const damageButtonRef = useRef<HTMLButtonElement | null>(null);
  const damagePanelRef = useRef<HTMLDivElement | null>(null);

  // Efeito para fechar painéis/foco ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !boardRef.current?.contains(target) &&
        !attributesButtonRef.current?.contains(target) &&
        !attributesPanelRef.current?.contains(target) &&
        !damageButtonRef.current?.contains(target) &&
        !damagePanelRef.current?.contains(target)
      ) {
        setFocusedCardId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openSelection = useCallback(() => {
    if (disableSelection) return;
    setActionError(null);
    setIsSelecting(true);
    if (!isMaster) setFocusedCardId(null);
    setAttributesOpen(false);
    setDamageOpen(false);
  }, [disableSelection, isMaster]);

  const closeSelection = useCallback(() => {
    setActionError(null);
    setIsSelecting(false);
    if (!isMaster) setFocusedCardId(null);
  }, [isMaster]);

  const handleToggleAttributes = useCallback(() => {
    if (isMaster && !focusedCardId && orderedCharacters.length > 0) {
      setFocusedCardId(orderedCharacters[0].id);
    } else if (!isMaster && playerCharacterId) {
      setFocusedCardId(playerCharacterId);
    }
    setDamageOpen(false);
    setAttributesOpen((prev) => !prev);
  }, [isMaster, focusedCardId, orderedCharacters, playerCharacterId]);

  const handleToggleDamage = useCallback(() => {
    if (isMaster && !focusedCardId && orderedCharacters.length > 0) {
      setFocusedCardId(orderedCharacters[0].id);
    } else if (!isMaster && playerCharacterId) {
      setFocusedCardId(playerCharacterId);
    }
    setAttributesOpen(false);
    setDamageOpen((prev) => !prev);
  }, [isMaster, focusedCardId, orderedCharacters, playerCharacterId]);

  return {
    // State
    focusedCardId,
    setFocusedCardId,
    isAttributesOpen,
    setAttributesOpen,
    isDamageOpen,
    setDamageOpen,
    isSelecting,
    actionError,
    setActionError,
    // Refs
    boardRef,
    attributesButtonRef,
    attributesPanelRef,
    damageButtonRef,
    damagePanelRef,
    // Handlers
    openSelection,
    closeSelection,
    handleToggleAttributes,
    handleToggleDamage,
  };
}
