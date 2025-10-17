import { useState, useMemo, useCallback, useEffect } from "react";
import {
  createAppliedEffect,
  fetchCharacterStatus,
  rollCustom,
  updateStatus,
} from "@/lib/api";
import type { RollCustomResponse } from "@/lib/api";
import type { Character } from "@/types/models";
import { EffectDTO } from "@rpg/shared";
import { SourceType } from "@/types/models";
import { mutate as mutateCache } from "swr";
import { statusCacheKey } from "@/hooks/useStatus";
import type { StatusAction, StatusActionOption } from "../statusActions";
import { STATUS_ACTION_OPTIONS } from "../statusActions";

interface UseDamagePanelProps {
  isMaster: boolean;
  characters: Character[];
  effects: EffectDTO[] | undefined;
  effectsLoading: boolean;
  focusedCharacterId: string | null;
}

export function useDamagePanel({
  isMaster,
  characters,
  effects,
  effectsLoading,
  focusedCharacterId,
}: UseDamagePanelProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] =
    useState<StatusAction>("PHYSICAL_DAMAGE");
  const [formula, setFormula] = useState("");
  const [roll, setRoll] = useState<RollCustomResponse | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const charactersById = useMemo(() => {
    return characters.reduce(
      (acc, char) => {
        acc[char.id] = char;
        return acc;
      },
      {} as Record<string, Character>,
    );
  }, [characters]);

  const effectByName = useMemo(() => {
    if (!effects) return {};
    return effects.reduce(
      (acc, effect) => {
        if (effect.deletedAt) return acc;
        acc[effect.name.toLowerCase()] = effect;
        return acc;
      },
      {} as Record<string, EffectDTO>,
    );
  }, [effects]);

  const selectedActionConfig = useMemo<StatusActionOption>(
    () =>
      STATUS_ACTION_OPTIONS.find((opt) => opt.value === selectedAction) ??
      STATUS_ACTION_OPTIONS[0],
    [selectedAction],
  );

  const effectAvailable = useMemo(
    () =>
      Boolean(
        selectedActionConfig &&
          effectByName[selectedActionConfig.effectName.toLowerCase()],
      ),
    [selectedActionConfig, effectByName],
  );

  const handleRoll = useCallback(async () => {
    if (!formula.trim()) {
      setError("Informe uma fórmula antes de rolar.");
      return;
    }
    setIsRolling(true);
    setError(null);
    setMessage(null);
    try {
      const result = await rollCustom(formula);
      setRoll(result);
      setMessage(`Rolagem concluída. Total: ${result.total}.`);
    } catch (err) {
      console.error("Falha ao rolar alteração de status:", err);
      setRoll(null);
      setError("Não foi possível rolar essa fórmula agora.");
    } finally {
      setIsRolling(false);
    }
  }, [formula]);

  const handleReset = useCallback(() => {
    setRoll(null);
    setMessage(null);
    setError(null);
    setFormula("");
  }, []);

  const handleApply = useCallback(async () => {
    if (!isMaster) return;
    if (!selectedTargetId) {
      setError("Selecione um alvo para aplicar a alteração.");
      return;
    }
    if (!roll) {
      setError("Realize uma rolagem antes de aplicar a alteração.");
      return;
    }
    if (effectsLoading) {
      setError("Os efeitos ainda estão carregando. Tente novamente.");
      return;
    }

    const effect = effectByName[selectedActionConfig.effectName.toLowerCase()];
    if (!effect) {
      setError(
        "Nenhum efeito configurado foi encontrado para esse tipo de alteração.",
      );
      return;
    }

    const roundedTotal = Math.round(roll.total);
    const amount = Math.max(0, Math.abs(roundedTotal));

    if (!Number.isFinite(amount)) {
      setError("Valor inválido.");
      return;
    }

    const effectValue = selectedActionConfig.isIncrease ? amount : -amount;

    try {
      setIsApplying(true);
      setError(null);

      await createAppliedEffect({
        characterId: selectedTargetId,
        effectId: effect.id,
        sourceType: SourceType.OTHER,
        duration: 0,
        startedAt: 0,
        expiresAt: 0,
        stacks: 1,
        value: effectValue,
      });

      let statusMessage = "";
      try {
        const statusList = await fetchCharacterStatus(selectedTargetId);
        const targetStatus = statusList.find(
          (status) =>
            status.name.toLowerCase() ===
            selectedActionConfig.targetStatus.toLowerCase(),
        );
        if (targetStatus) {
          const currentValue = Number(targetStatus.valueActual ?? 0);
          const rawMax =
            Number(targetStatus.valueMax ?? 0) +
            Number(targetStatus.valueBonus ?? 0);
          const safeMax = Number.isFinite(rawMax) ? Math.max(0, rawMax) : 0;
          let nextValue = currentValue + effectValue;
          if (safeMax > 0) {
            nextValue = Math.min(safeMax, nextValue);
          }
          nextValue = Math.max(0, nextValue);
          let updatedStatuses = statusList;
          if (nextValue !== currentValue) {
            await updateStatus(targetStatus.id, { valueActual: nextValue });
            updatedStatuses = statusList.map((status) =>
              status.id === targetStatus.id
                ? { ...status, valueActual: nextValue }
                : status,
            );
          }
          const cacheKey = statusCacheKey(selectedTargetId);
          if (cacheKey) {
            await mutateCache(cacheKey, updatedStatuses, { revalidate: false });
          }
          statusMessage = ` ${selectedActionConfig.targetStatus} atual: ${Math.round(nextValue)}/${Math.round(safeMax > 0 ? safeMax : Math.max(currentValue, nextValue))}.`;
        }
      } catch (statusError) {
        console.error("Falha ao atualizar status:", statusError);
        statusMessage =
          " (Efeito registrado, mas não foi possível atualizar o status automaticamente.)";
      }

      const target = charactersById[selectedTargetId];
      setMessage(
        `${target ? `${selectedActionConfig.label} (${amount}) em ${target.name}` : `${selectedActionConfig.label} (${amount}`}.${statusMessage}`,
      );
      setRoll(null);
    } catch (err) {
      console.error("Falha ao aplicar alteração de status:", err);
      setError("Não foi possível aplicar a alteração agora.");
    } finally {
      setIsApplying(false);
    }
  }, [
    isMaster,
    selectedTargetId,
    roll,
    effectsLoading,
    effectByName,
    selectedActionConfig,
    charactersById,
    setError,
    setIsApplying,
    setMessage,
    setRoll,
  ]);

  // Efeito para sincronizar o alvo selecionado
  useEffect(() => {
    const targetExists = characters.some((c) => c.id === selectedTargetId);
    if (targetExists) return;

    if (
      focusedCharacterId &&
      characters.some((c) => c.id === focusedCharacterId)
    ) {
      setSelectedTargetId(focusedCharacterId);
    } else if (characters.length > 0) {
      setSelectedTargetId(characters[0].id);
    } else {
      setSelectedTargetId(null);
    }
  }, [focusedCharacterId, characters, selectedTargetId]);

  return {
    selectedTargetId,
    setSelectedTargetId,
    selectedAction,
    setSelectedAction,
    formula,
    setFormula,
    roll,
    isRolling,
    isApplying,
    error,
    message,
    effectAvailable,
    handleRoll,
    handleReset,
    handleApply,
    clearState: handleReset,
  };
}
