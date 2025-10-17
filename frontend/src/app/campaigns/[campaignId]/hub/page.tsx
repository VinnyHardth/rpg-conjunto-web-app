"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import useSWR, { mutate as mutateCache } from "swr";

import { useUser } from "@/hooks/useUser";
import { useCharacters } from "@/hooks/useCharacters";
import { fetchAttributeKinds, fetchEffects } from "@/lib/api";
import {
  CampaignMemberWithUser,
  CampaignMemberRole,
  CharacterPerCampaignWithCharacter,
  Attributes,
  AttributeKind,
} from "@/types/models";
import type { EffectDTO } from "@rpg/shared";
import { statusCacheKey } from "@/hooks/useStatus";
import StatusValuePanel from "./components/StatusValuePanel";
import { useCampaignSocket } from "./hooks/useCampaignSocket";
import type {
  CampaignCharacterEventPayload,
  StatusUpdatedPayload,
} from "./socketTypes";
import { useCampaignData } from "./hooks/useCampaignData";
import CampaignHubHeader from "./components/CampaignHubHeader";
import CharacterSelection from "./components/CharacterSelection";
import CharacterBoard from "./components/CharacterBoard";
import AttributesPanel from "./components/AttributesPanel";
import { useCharacterManagement } from "./hooks/useCharacterManagement";
import { useDamagePanel } from "./hooks/useDamagePanel";
import { useDiceRolls } from "./hooks/useDiceRolls";
import { useHubInterface } from "./hooks/useHubInterface";
import { CampaignHubProvider } from "./contexts/CampaignHubContext";

type Relation = CharacterPerCampaignWithCharacter;

const getSocketUrl = (): string => {
  return "/api/socket.io";
};

export default function CampaignHubByIdPage() {
  const params = useParams();
  const campaignIdParam = params?.campaignId;
  const campaignId = Array.isArray(campaignIdParam)
    ? campaignIdParam[0]
    : campaignIdParam;

  const { user, loading: userLoading } = useUser();
  const { characters: userCharacters, isLoading: userCharsLoading } =
    useCharacters(user?.id);

  const { campaign, members, relations, isLoading, error, setRelations } =
    useCampaignData(campaignId);

  const mutateRelations = useCallback(
    (
      updater: Relation[] | ((current: Relation[]) => Relation[]),
      options?: { revalidate: boolean },
    ) => {
      // The options argument is not used here, but is required for type
      // compatibility with the hooks that consume this function.
      setRelations(updater as (current: Relation[]) => Relation[]);
    },
    [setRelations],
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

  // Lógica de gerenciamento de personagens movida para o hook
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
    campaignId: campaignId!,
    relations: relations ?? [],
    mutateRelations,
    isMaster,
    user,
    userCharacters,
    memberIds: members.map((m) => m.userId).filter(Boolean) as string[],
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

  // Lógica de gerenciamento da interface do Hub
  const hubInterface = useHubInterface({
    isMaster,
    playerCharacterId,
    orderedCharacters,
    disableSelection,
  });
  const {
    focusedCardId,
    isAttributesOpen,
    isDamageOpen,
    isSelecting,
    actionError,
    handleToggleAttributes,
    handleToggleDamage,
    openSelection,
    closeSelection,
  } = hubInterface;

  // Lógica do painel de dano movida para o hook
  const damagePanel = useDamagePanel({
    isMaster,
    characters: orderedCharacters,
    effects,
    effectsLoading,
    focusedCharacterId: focusedCardId,
  });

  // Lógica de rolagens de dificuldade movida para o hook
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
    socketHandlers: diceRollSocketHandlers,
  } = diceRolls;

  const sidebarCharacterId = isMaster ? focusedCardId : playerCharacterId;

  const sidebarRoll = useMemo(() => {
    if (!sidebarCharacterId) return null;
    return rollsByCharacter[sidebarCharacterId] ?? null;
  }, [rollsByCharacter, sidebarCharacterId]);

  useEffect(() => {
    if (isDamageOpen) return;
    damagePanel.clearState();
  }, [isDamageOpen, damagePanel]);

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
      if (payload.relation.character) {
        // O hook useCharacterManagement irá lidar com a atualização do mapa
      }
    },
    [campaignId, mutateRelations],
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
      diceRollSocketHandlers.onCharacterUnlinked(payload.relation);
    },
    [campaignId, mutateRelations, diceRollSocketHandlers],
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

  const socketHandlers = useMemo(
    () => ({
      ...diceRollSocketHandlers,
      onCharacterLinked: handleCharacterLinked,
      onCharacterUnlinked: handleCharacterUnlinked,
      onStatusUpdated: handleStatusUpdated,
    }),
    [
      diceRollSocketHandlers,
      handleCharacterLinked,
      handleCharacterUnlinked,
      handleStatusUpdated,
    ],
  );

  useCampaignSocket({
    campaignId: campaignId ?? null,
    socketUrl,
    handlers: socketHandlers,
  });

  const activeRollsContent =
    activeRollEntries.length === 0 ? (
      <p className="text-sm text-slate-300">
        Nenhuma rolagem ativa no momento.
      </p>
    ) : (
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
          {activeRollEntries.map(({ character, roll }) => (
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
              <div className="mt-1 text-xs text-slate-300">
                <p>
                  Sucessos: {roll.successes}/{roll.diceCount} • Limiar ≥{" "}
                  {roll.threshold}
                </p>
                <p>
                  Rolagens:{" "}
                  {roll.rolls.length > 0 ? roll.rolls.join(", ") : "—"}
                </p>
                <p>Dificuldade {roll.difficulty}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );

  if (!campaignId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p>Campanha não encontrada.</p>
      </main>
    );
  }

  if (!user && !userLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p>Faça login para acessar este hub.</p>
      </main>
    );
  }

  const providerValue = {
    useCampaignData: {
      campaign,
      members,
      relations,
      isLoading,
      error,
      setRelations,
      mutateRelations,
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
  };

  return (
    <CampaignHubProvider value={providerValue}>
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <button
              ref={hubInterface.attributesButtonRef}
              type="button"
              onClick={handleToggleAttributes}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
              aria-haspopup="dialog"
              aria-expanded={isAttributesOpen}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="16"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="11"
                  y1="5"
                  x2="11"
                  y2="19"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              Atributos
            </button>

            <button
              ref={hubInterface.damageButtonRef}
              type="button"
              onClick={handleToggleDamage}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-800/90 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
              aria-haspopup="dialog"
              aria-expanded={isDamageOpen}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 19 12 5l7 14M6 16h12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Valor de Status
            </button>
          </div>

          <CampaignHubHeader
            campaign={campaign}
            isMaster={isMaster}
            isSelecting={isSelecting}
            showPlayerSelectButton={showPlayerSelectButton}
            disableSelection={disableSelection}
            openSelection={openSelection}
          />

          {hasError && (
            <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <AttributesPanel
            onClose={() => hubInterface.setAttributesOpen(false)} // onClose é local e necessário
          />

          <StatusValuePanel
            onClose={() => hubInterface.setDamageOpen(false)}
            activeRollsContent={activeRollsContent}
          />

          {isSelecting ? (
            <CharacterSelection
              availableCharacters={availableCharacters}
              user={user}
              isSaving={isSaving} // from useCharacterManagement
              handleAttachCharacter={(char) =>
                handleAttachCharacter(char).then(closeSelection)
              }
              closeSelection={closeSelection}
              actionError={actionError}
              isAttributesOpen={isAttributesOpen}
            />
          ) : (
            <CharacterBoard />
          )}
          {actionError && !isSelecting && (
            <p className="text-sm text-red-200">{actionError}</p>
          )}
        </div>
      </main>
    </CampaignHubProvider>
  );
}
