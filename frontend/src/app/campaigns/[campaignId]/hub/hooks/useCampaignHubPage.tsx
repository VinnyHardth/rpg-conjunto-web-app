import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type RefObject,
} from "react";
import useSWR, { mutate as mutateCache } from "swr";

import { useUser } from "@/hooks/useUser";
import { useCharacters } from "@/hooks/useCharacters";
import { fetchAttributeKinds, fetchEffects } from "@/lib/api";
import {
  Attributes,
  AttributeKind,
  CampaignMemberRole,
  type Campaign,
  type CampaignMemberWithUser,
  type Character,
  type User,
  type CharacterPerCampaignWithCharacter,
} from "@/types/models";
import type { EffectDTO } from "@rpg/shared";
import { statusCacheKey } from "@/hooks/useStatus";
import { useCampaignSocket } from "./useCampaignSocket";
import type {
  CampaignCharacterEventPayload,
  StatusUpdatedPayload,
} from "../socketTypes";
import { useCampaignData } from "./useCampaignData";
import { useCharacterManagement } from "./useCharacterManagement";
import { useDamagePanel } from "./useDamagePanel";
import { useDiceRolls } from "./useDiceRolls";
import { useHubInterface } from "./useHubInterface";
import { useSelectCharacter } from "./useSelectCharacter";
import { useRestActions } from "./useRestActions";

type Relation = CharacterPerCampaignWithCharacter;

export type CampaignHubLayoutProps = {
  campaign: Campaign | null;
  isMaster: boolean;
  showPlayerSelectButton: boolean;
  disableSelection: boolean;
  openSelection: () => void;
  hasError: boolean;
  error: string | null;
  isSelecting: boolean;
  isAttributesOpen: boolean;
  isDamageOpen: boolean;
  handleToggleAttributes: () => void;
  handleToggleDamage: () => void;
  onAttributesPanelClose: () => void;
  onDamagePanelClose: () => void;
  activeRollsContent: ReactNode;
  availableCharacters: Character[];
  user: User | null;
  isSaving: boolean;
  handleCharacterSelect: (character: Character) => Promise<void>;
  closeSelection: () => void;
  characterManagementError: string | null;
  actionError: string | null;
  attributesButtonRef: RefObject<HTMLButtonElement | null>;
  damageButtonRef: RefObject<HTMLButtonElement | null>;
  difficultyTarget: number | null;
  difficultyInputValue: string;
  onDifficultyInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDifficultyClear: () => void;
};

export function useCampaignHubPage(campaignId: string | undefined) {
  const { user, loading: userLoading } = useUser();
  const { characters: userCharacters, isLoading: userCharsLoading } =
    useCharacters(user?.id);

  const {
    campaign,
    members,
    relations,
    isLoading,
    error,
    setRelations,
    refreshRelations,
    reloadCampaignData,
  } = useCampaignData(campaignId);

  const mutateRelations = useCallback(
    (
      updater: Relation[] | ((current: Relation[]) => Relation[]),
      options?: { revalidate: boolean },
    ) => {
      setRelations((current) => {
        const currentRelations = current ?? [];
        const nextRelations =
          typeof updater === "function"
            ? (updater as (state: Relation[]) => Relation[])(currentRelations)
            : updater;

        return Array.isArray(nextRelations) ? nextRelations : currentRelations;
      });

      if (options?.revalidate) {
        void refreshRelations();
      }
    },
    [setRelations, refreshRelations],
  );

  const { data: attributeDefinitions } = useSWR<Attributes[]>(
    "attribute-definitions",
    () => fetchAttributeKinds(AttributeKind.ATTRIBUTE),
    { revalidateOnFocus: false },
  );

  const { data: expertiseDefinitions } = useSWR<Attributes[]>(
    "expertise-definitions",
    () => fetchAttributeKinds(AttributeKind.EXPERTISE),
    { revalidateOnFocus: false },
  );

  const {
    data: effects,
    isLoading: effectsLoading,
    error: effectsError,
  } = useSWR<EffectDTO[]>("effects", fetchEffects, {
    revalidateOnFocus: false,
  });

  const membership = useMemo(() => {
    if (!user) return null;
    const memberRecord =
      members?.find((member) => member.userId === user.id) ?? null;

    if (memberRecord) {
      return memberRecord;
    }

    if (campaign && user.id === campaign.creatorId) {
      return {
        id: `creator-${campaign.id}`,
        campaignId: campaign.id,
        userId: user.id,
        role: CampaignMemberRole.MASTER,
        status: "ACTIVE",
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        deletedAt: null,
        user,
      } as CampaignMemberWithUser;
    }

    return null;
  }, [members, user, campaign]);

  const isMaster = membership?.role === CampaignMemberRole.MASTER;

  const {
    orderedCharacters,
    characterMap,
    charactersLoading,
    memberCharsLoading,
    availableCharacters,
    userHasCharacter,
    isSaving,
    removingId,
    actionError: characterManagementError,
    handleAttachCharacter,
    handleDetachCharacter,
  } = useCharacterManagement({
    campaignId: campaignId ?? "",
    relations: relations ?? [],
    mutateRelations,
    isMaster,
    user,
    userCharacters,
    memberIds: members.map((m) => m.userId).filter(Boolean) as string[],
    onRecover: reloadCampaignData,
  });

  const playerCharacterId = useMemo(() => {
    if (!user) return null;
    return (
      orderedCharacters.find((character) => character.userId === user.id)?.id ??
      null
    );
  }, [orderedCharacters, user]);

  const loadingState =
    userLoading ||
    isLoading ||
    charactersLoading ||
    userCharsLoading ||
    memberCharsLoading;
  const hasError = Boolean(error);
  const disableSelection =
    availableCharacters.length === 0 || loadingState || hasError;

  const { focusedCardId, handleFocusCard, ensureAndGetFocus } =
    useSelectCharacter({
      isMaster,
      playerCharacterId,
      orderedCharacters,
    });

  const hubInterface = useHubInterface({
    disableSelection,
    focusedCardId,
    handleFocusCard,
  });

  const {
    isAttributesOpen,
    isDamageOpen,
    isSelecting,
    actionError,
    setAttributesOpen,
    setDamageOpen,
    openSelection,
    closeSelection,
  } = hubInterface;

  const handleToggleAttributes = useCallback(() => {
    ensureAndGetFocus();
    setDamageOpen(false);
    setAttributesOpen((prev) => !prev);
  }, [ensureAndGetFocus, setDamageOpen, setAttributesOpen]);

  const damagePanel = useDamagePanel({
    isMaster,
    characters: orderedCharacters,
    effects,
    effectsLoading,
    focusedCharacterId: focusedCardId,
  });
  const { setSelectedTargetId, handleReset } = damagePanel;

  const handleToggleDamage = useCallback(() => {
    if (!isDamageOpen) {
      const targetId = ensureAndGetFocus();
      setSelectedTargetId(targetId);
    }
    setDamageOpen((prev) => !prev);
  }, [isDamageOpen, ensureAndGetFocus, setDamageOpen, setSelectedTargetId]);

  const diceRolls = useDiceRolls({
    campaignId: campaignId ?? null,
    isMaster,
    orderedCharacters,
  });
  const {
    rollsByCharacter,
    rollError,
    activeRollEntries,
    handleClearRolls,
    difficultyTarget,
    setDifficultyTarget,
    socketHandlers: diceRollSocketHandlers,
  } = diceRolls;

  const [difficultyInputValue, setDifficultyInputValue] = useState(
    difficultyTarget !== null ? String(difficultyTarget) : "",
  );

  useEffect(() => {
    setDifficultyInputValue(
      difficultyTarget !== null ? String(difficultyTarget) : "",
    );
  }, [difficultyTarget]);

  const handleDifficultyInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      if (!/^\d*$/.test(rawValue)) return;

      setDifficultyInputValue(rawValue);

      if (rawValue === "") {
        setDifficultyTarget(null);
        return;
      }

      const parsed = Number(rawValue);
      if (Number.isFinite(parsed)) {
        setDifficultyTarget(parsed);
      }
    },
    [setDifficultyTarget],
  );

  const handleDifficultyClear = useCallback(() => {
    setDifficultyInputValue("");
    setDifficultyTarget(null);
  }, [setDifficultyTarget]);

  const restActions = useRestActions({
    campaignId: campaignId ?? "",
    characters: relations ?? [],
    mutateRelations,
  });

  const sidebarCharacterId = isMaster ? focusedCardId : playerCharacterId;

  const sidebarRoll = useMemo(() => {
    if (!sidebarCharacterId) return null;
    return rollsByCharacter[sidebarCharacterId] ?? null;
  }, [rollsByCharacter, sidebarCharacterId]);

  useEffect(() => {
    if (isDamageOpen) return;
    handleReset();
  }, [isDamageOpen, handleReset]);

  const sidebarCharacter = useMemo(() => {
    if (!sidebarCharacterId) {
      return isMaster
        ? null
        : (orderedCharacters.find((c) => c.userId === user?.id) ?? null);
    }
    return (
      orderedCharacters.find(
        (character) => character.id === sidebarCharacterId,
      ) ?? null
    );
  }, [orderedCharacters, sidebarCharacterId, isMaster, user]);

  const canSelect = !!(
    campaignId &&
    !userLoading &&
    user &&
    (isMaster || (!isMaster && !userHasCharacter))
  );

  const showPlayerSelectButton = !isMaster && canSelect;

  const getSocketUrl = (): string => {
    return process.env.NEXT_PUBLIC_SOCKET_URL ?? "/socket.io";
  };

  const socketUrl = useMemo(() => getSocketUrl(), []);

  const handleCharacterLinked = useCallback(
    (payload: CampaignCharacterEventPayload) => {
      if (payload.campaignId !== campaignId) return;
      mutateRelations(
        (current) => {
          if (!current) return [payload.relation];
          const index = current.findIndex(
            (item) => item.id === payload.relation.id,
          );
          if (index !== -1) {
            const next = [...current];
            next[index] = payload.relation;
            return next;
          }
          return [...current, payload.relation];
        },
        { revalidate: false },
      );

      if (!payload.relation.character) {
        void refreshRelations();
      }
    },
    [campaignId, mutateRelations, refreshRelations],
  );

  const handleCharacterUnlinked = useCallback(
    (payload: CampaignCharacterEventPayload) => {
      if (payload.campaignId !== campaignId) return;
      mutateRelations(
        (current) => {
          if (!current) return current;
          const index = current.findIndex(
            (item) => item.id === payload.relation.id,
          );
          if (index === -1) return current;
          const next = [...current];
          next[index] = payload.relation;
          return next;
        },
        { revalidate: false },
      );

      if (!payload.relation.character) {
        void refreshRelations();
      }
    },
    [campaignId, mutateRelations, refreshRelations],
  );

  const handleStatusUpdated = useCallback(
    (payload: StatusUpdatedPayload) => {
      if (payload.campaignId !== campaignId) return;
      const cacheKey = statusCacheKey(payload.characterId);
      if (cacheKey) {
        mutateCache(cacheKey, payload.statuses, { revalidate: false });
      }
    },
    [campaignId],
  );

  const socketHandlersRef = useRef({
    ...diceRollSocketHandlers,
    onCharacterLinked: handleCharacterLinked,
    onCharacterUnlinked: handleCharacterUnlinked,
    onStatusUpdated: handleStatusUpdated,
  });

  useEffect(() => {
    socketHandlersRef.current = {
      ...diceRollSocketHandlers,
      onCharacterLinked: handleCharacterLinked,
      onCharacterUnlinked: handleCharacterUnlinked,
      onStatusUpdated: handleStatusUpdated,
    };
  }, [
    diceRollSocketHandlers,
    handleCharacterLinked,
    handleCharacterUnlinked,
    handleStatusUpdated,
  ]);

  useCampaignSocket({
    campaignId: campaignId ?? null,
    socketUrl,
    handlers: socketHandlersRef,
  });

  const activeRollsContent = useMemo(() => {
    const formatModifierValue = (value: number): string => {
      if (value > 0) return `+${value}`;
      if (value < 0) return `${value}`;
      return "0";
    };

    if (activeRollEntries.length === 0) {
      return (
        <p className="text-sm text-slate-300">
          Nenhuma rolagem ativa no momento.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {isMaster && (
          <button
            type="button"
            onClick={handleClearRolls}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-white shadow transition hover:bg-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
          >
            Limpar rolagens
          </button>
        )}

        {rollError && <p className="text-xs text-red-300">{rollError}</p>}

        <ul className="space-y-2">
          {activeRollEntries.map(({ character, roll }) => {
            const deriveAbbreviation = (name: string | null | undefined) => {
              if (!name) return null;
              return name.trim().slice(0, 3).toUpperCase();
            };
            const attributeAbbreviation =
              roll.attributeAbbreviation ??
              deriveAbbreviation(roll.attributeName);
            const attributeLabel = (() => {
              if (roll.attributeName && attributeAbbreviation) {
                return `${roll.attributeName} (${attributeAbbreviation})`;
              }
              return roll.attributeName ?? attributeAbbreviation ?? "ATR";
            })();
            const modifiers = roll.modifiers ?? {
              attribute: roll.attributeValue ?? 0,
              expertise: roll.expertiseValue ?? 0,
              misc: roll.miscBonus ?? 0,
            };
            const hasExpertiseInfo = !!roll.expertiseName;
            const hasMiscBonus = modifiers.misc !== 0;
            const difficultyValue = difficultyTarget;
            const hasDifficulty = typeof difficultyValue === "number";
            const passedDifficulty = hasDifficulty
              ? roll.total >= (difficultyValue ?? 0)
              : null;

            return (
              <li
                key={character.id}
                className="rounded-lg border border-white/10 bg-slate-900/50 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">
                    {character.name}
                  </span>
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                    {roll.attributeAbbreviation}
                  </span>
                </div>
                <div className="mt-1 space-y-1 text-xs text-slate-300">
                  <p>
                    d20:{" "}
                    {roll.rolls.length > 0
                      ? roll.rolls.join(", ")
                      : roll.baseRoll}
                  </p>
                  <p className="text-white">
                    Total: {roll.total}
                    {hasDifficulty && (
                      <>
                        {" "}
                        • DT {difficultyValue}{" "}
                        <span
                          className={
                            passedDifficulty
                              ? "text-emerald-300"
                              : "text-rose-300"
                          }
                        >
                          {passedDifficulty ? "Sucesso" : "Falha"}
                        </span>
                      </>
                    )}
                  </p>
                  <p className="text-white/70">
                    Expressão: {roll.renderedExpression}
                  </p>
                  <p>
                    Modificadores: {attributeLabel}{" "}
                    {formatModifierValue(modifiers.attribute)}
                    {hasExpertiseInfo && (
                      <>
                        {" "}
                        • {roll.expertiseName}:{" "}
                        {formatModifierValue(modifiers.expertise)}
                      </>
                    )}
                    {hasMiscBonus && (
                      <> • Bônus: {formatModifierValue(modifiers.misc)}</>
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }, [
    activeRollEntries,
    difficultyTarget,
    handleClearRolls,
    isMaster,
    rollError,
  ]);

  const providerValue = useMemo(
    () => ({
      useCampaignData: {
        campaign,
        members,
        relations,
        isLoading,
        error,
        setRelations,
        mutateRelations,
        refreshRelations,
        reloadCampaignData,
      },
      useCharacterManagement: {
        orderedCharacters,
        characterMap,
        charactersLoading,
        memberCharsLoading,
        availableCharacters,
        userHasCharacter,
        isSaving,
        removingId,
        actionError: characterManagementError,
        handleAttachCharacter,
        handleDetachCharacter,
      },
      useDiceRolls: diceRolls,
      useDamagePanel: damagePanel,
      useHubInterface: hubInterface,
      useSelectCharacter: { focusedCardId, handleFocusCard, ensureAndGetFocus },
      useRestActions: restActions,
      isMaster,
      sidebarCharacterId,
      sidebarCharacter,
      sidebarRoll,
      attributeDefinitions,
      expertiseDefinitions,
      effects,
      effectsLoading,
      effectsError: effectsError ? (effectsError as Error) : null,
      disableSelection,
      user,
    }),
    [
      campaign,
      members,
      relations,
      isLoading,
      error,
      setRelations,
      mutateRelations,
      refreshRelations,
      reloadCampaignData,
      orderedCharacters,
      characterMap,
      charactersLoading,
      memberCharsLoading,
      availableCharacters,
      userHasCharacter,
      isSaving,
      removingId,
      characterManagementError,
      handleAttachCharacter,
      handleDetachCharacter,
      diceRolls,
      damagePanel,
      hubInterface,
      focusedCardId,
      handleFocusCard,
      ensureAndGetFocus,
      restActions,
      isMaster,
      sidebarCharacterId,
      sidebarCharacter,
      sidebarRoll,
      attributeDefinitions,
      expertiseDefinitions,
      effects,
      effectsLoading,
      effectsError,
      disableSelection,
      user,
    ],
  );

  const handleCharacterSelect = useCallback(
    async (character: Character) => {
      try {
        await handleAttachCharacter(character);
        closeSelection();
      } catch {
        // Estado já é recuperado pela callback passada para useCharacterManagement.
      }
    },
    [handleAttachCharacter, closeSelection],
  );

  const layoutProps: CampaignHubLayoutProps = {
    campaign,
    isMaster,
    showPlayerSelectButton,
    disableSelection,
    openSelection,
    hasError,
    error,
    isSelecting,
    isAttributesOpen,
    isDamageOpen,
    handleToggleAttributes,
    handleToggleDamage,
    onAttributesPanelClose: () => hubInterface.setAttributesOpen(false),
    onDamagePanelClose: () => hubInterface.setDamageOpen(false),
    activeRollsContent,
    availableCharacters,
    user,
    isSaving,
    handleCharacterSelect,
    closeSelection,
    characterManagementError,
    actionError,
    attributesButtonRef: hubInterface.attributesButtonRef,
    damageButtonRef: hubInterface.damageButtonRef,
    difficultyTarget,
    difficultyInputValue,
    onDifficultyInputChange: handleDifficultyInputChange,
    onDifficultyClear: handleDifficultyClear,
  };

  return {
    campaignId,
    user,
    userLoading,
    isLoading,
    error,
    hasError,
    providerValue,
    layoutProps,
  };
}
