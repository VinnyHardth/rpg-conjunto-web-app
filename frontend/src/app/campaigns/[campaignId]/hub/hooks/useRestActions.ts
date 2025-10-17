import { useState, useCallback } from "react";
import { fetchCharacterStatus, updateMultipleStatuses, type StatusUpdateItem } from "@/lib/api";
import type { CharacterPerCampaignWithCharacter } from "@/types/models";

export enum RestType {
  SHORT = "short",
  LONG = "long",
}

interface UseRestActionsProps {
  campaignId: string;
  characters: CharacterPerCampaignWithCharacter[];
  mutateRelations: (
    updater:
      | CharacterPerCampaignWithCharacter[]
      | ((
          current: CharacterPerCampaignWithCharacter[],
        ) => CharacterPerCampaignWithCharacter[]),
    options?: { revalidate: boolean },
  ) => void;
}

export function useRestActions({
  characters,
  mutateRelations,
}: UseRestActionsProps) {
  const [isResting, setIsResting] = useState(false);
  const [restError, setRestError] = useState<string | null>(null);
  const [restMessage, setRestMessage] = useState<string | null>(null);

  const clearState = useCallback(() => {
    setRestError(null);
    setRestMessage(null);
  }, []);

  const handleRest = useCallback(
    async (type: RestType) => {
      setIsResting(true);
      clearState();

      console.log("Iniciando descanso...");

      console.log("Personagens selecionados:", characters);

      const allStatuses = await Promise.all(
        characters.map((character) => fetchCharacterStatus(character.characterId)),
      );

      console.log("Statuses iniciais:", allStatuses);

      const recoveryRate = type === RestType.LONG ? 1 : 0.5;

      const statusUpdates: StatusUpdateItem[] = allStatuses.flatMap(
        (statuses) => {
          return statuses.map((status) => ({
            statusId: status.id,
            name: status.name,
              valueActual: Math.min(
                status.valueMax,
                status.valueActual + Math.floor(status.valueMax * recoveryRate),
              ),
          }));
        },
      )
      
      console.log("Statuses a serem atualizados:", statusUpdates);

      if (statusUpdates.length === 0) {
        setRestError("Nenhum personagem para aplicar o descanso.");
        setIsResting(false);
        return;
      }

      try {
        // Usa a função existente que atualiza múltiplos status individualmente
        await updateMultipleStatuses(statusUpdates);

        const successMessage =
          type === RestType.LONG
            ? "Descanso longo aplicado com sucesso!"
            : "Descanso curto aplicado com sucesso!";
        setRestMessage(successMessage);

        // Força a revalidação dos dados da campanha para buscar as alterações de todos.
        mutateRelations((current) => current, { revalidate: true });
      } catch (error) {
        console.error(`Falha ao aplicar descanso ${type}:`, error);
        setRestError(
          "Não foi possível aplicar o descanso a todos os personagens.",
        );
      } finally {
        setIsResting(false);
      }
    },
    [characters, mutateRelations, clearState],
  );

  return {
    isResting,
    restError,
    restMessage,
    handleRest,
    clearState,
  };
}