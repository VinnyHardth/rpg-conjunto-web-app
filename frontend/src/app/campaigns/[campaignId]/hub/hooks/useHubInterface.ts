import { useState, useRef, useEffect, useCallback, useMemo } from "react";

interface UseHubInterfaceProps {
  disableSelection: boolean;
  focusedCardId: string | null;
  handleFocusCard: (characterId: string | null) => void;
}

export function useHubInterface({
  disableSelection,
  focusedCardId,
  handleFocusCard,
}: UseHubInterfaceProps) {
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
        handleFocusCard(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleFocusCard]);

  const openSelection = useCallback(() => {
    if (disableSelection) return;
    setActionError(null);
    setIsSelecting(true);
    setAttributesOpen(false);
    setDamageOpen(false);
  }, [disableSelection]);

  const closeSelection = useCallback(() => {
    setActionError(null);
    setIsSelecting(false);
  }, []);

  return useMemo(
    () => ({
      // State
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
    }),
    [
      isAttributesOpen,
      setAttributesOpen,
      isDamageOpen,
      setDamageOpen,
      isSelecting,
      actionError,
      setActionError,
      boardRef,
      attributesButtonRef,
      attributesPanelRef,
      damageButtonRef,
      damagePanelRef,
      openSelection,
      closeSelection,
    ],
  );
}
