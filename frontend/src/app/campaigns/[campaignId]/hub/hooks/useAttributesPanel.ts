import { useState, useMemo, useEffect, useCallback } from "react";
import useSWR from "swr";
import {
  fetchCharacterAttributes,
  rollDifficulty as rollDifficultyRequest,
  type RollDifficultyResponse,
} from "@/lib/api";
import type { Attributes, CharacterAttribute } from "@/types/models";
import { resolveAbbreviation } from "../utils";

const DIFFICULTY_OPTIONS = ["Fácil", "Médio", "Difícil"] as const;
export type Difficulty = (typeof DIFFICULTY_OPTIONS)[number];

type AttributeRow = {
  name: string;
  base: number;
  inventory: number;
  extra: number;
  total: number;
};

interface UseAttributesPanelProps {
  isOpen: boolean;
  sidebarCharacterId: string | null;
  campaignId: string | null;
  attributeDefinitions?: Attributes[];
  expertiseDefinitions?: Attributes[];
  onRoll: (roll: RollDifficultyResponse) => void;
}

export function useAttributesPanel({
  isOpen,
  sidebarCharacterId,
  campaignId,
  attributeDefinitions,
  expertiseDefinitions,
  onRoll,
}: UseAttributesPanelProps) {
  const sidebarCharacterKey =
    isOpen && sidebarCharacterId
      ? `character-${sidebarCharacterId}-attributes`
      : null;

  const {
    data: sidebarAttributes,
    isLoading: sidebarAttributesLoading,
    error: sidebarAttributesError,
  } = useSWR<CharacterAttribute[]>(sidebarCharacterKey, () =>
    fetchCharacterAttributes(sidebarCharacterId!),
  );

  const [selectedAttributeRow, setSelectedAttributeRow] = useState<
    string | null
  >(null);
  const [selectedExpertiseRow, setSelectedExpertiseRow] = useState<
    string | null
  >(null);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("Médio");
  const [isRolling, setIsRolling] = useState(false);
  const [rollError, setRollError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedAttributeRow(null);
    setSelectedExpertiseRow(null);
    setRollError(null);
  }, [sidebarCharacterId]);

  const attributeTables = useMemo(() => {
    if (
      !sidebarCharacterId ||
      !sidebarAttributes ||
      !attributeDefinitions ||
      !expertiseDefinitions
    ) {
      return null;
    }

    const attributeMap = new Map(
      sidebarAttributes.map((item) => [item.attributeId, item]),
    );

    const buildRows = (defs: Attributes[]): AttributeRow[] =>
      defs.map(({ id, name }) => {
        const item = attributeMap.get(id);
        const base = item?.valueBase ?? 0;
        const inventory = item?.valueInv ?? 0;
        const extra = item?.valueExtra ?? 0;
        return {
          name,
          base,
          inventory,
          extra,
          total: base + inventory + extra,
        };
      });

    return {
      attributes: buildRows(attributeDefinitions),
      expertises: buildRows(expertiseDefinitions),
    };
  }, [
    sidebarCharacterId,
    sidebarAttributes,
    attributeDefinitions,
    expertiseDefinitions,
  ]);

  const selectedRollRow = useMemo(() => {
    if (!attributeTables) return null;

    if (selectedAttributeRow) {
      const match = attributeTables.attributes.find(
        (row) => row.name === selectedAttributeRow,
      );
      if (match) return { ...match, kind: "attribute" as const };
    }

    if (selectedExpertiseRow) {
      const match = attributeTables.expertises.find(
        (row) => row.name === selectedExpertiseRow,
      );
      if (match) return { ...match, kind: "expertise" as const };
    }

    return null;
  }, [attributeTables, selectedAttributeRow, selectedExpertiseRow]);

  const handleRoll = useCallback(async () => {
    if (!selectedRollRow || !sidebarCharacterId || !campaignId) return;

    const diceCount = Math.max(1, Math.floor(selectedRollRow.total));
    const attributeAbbreviation = resolveAbbreviation(selectedRollRow.name);

    setIsRolling(true);
    setRollError(null);
    try {
      const result = await rollDifficultyRequest({
        campaignId,
        characterId: sidebarCharacterId,
        attributeName: selectedRollRow.name,
        attributeAbbreviation,
        diceCount,
        difficulty: selectedDifficulty,
      });
      onRoll(result); // Notifica o componente pai sobre a nova rolagem
    } catch (error) {
      console.error("Falha ao rolar dados:", error);
      setRollError("Não foi possível rolar os dados agora.");
    } finally {
      setIsRolling(false);
    }
  }, [
    selectedRollRow,
    sidebarCharacterId,
    campaignId,
    selectedDifficulty,
    onRoll,
  ]);

  const isLoading =
    Boolean(isOpen && sidebarCharacterId) &&
    (sidebarAttributesLoading ||
      !attributeDefinitions ||
      !expertiseDefinitions);

  return {
    isLoading,
    error: sidebarAttributesError,
    attributeTables,
    selectedAttributeRow,
    setSelectedAttributeRow,
    selectedExpertiseRow,
    setSelectedExpertiseRow,
    selectedRollRow,
    isRolling,
    rollError,
    handleRoll,
    selectedDifficulty,
    setSelectedDifficulty,
    DIFFICULTY_OPTIONS,
  };
}
