"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import useSWR, { mutate as mutateCache } from "swr";

import CharacterCard from "@/components/CharacterCard";
import { useUser } from "@/hooks/useUser";
import { useCharacters } from "@/hooks/useCharacters";
import {
  addCharacterToCampaign,
  fetchCampaignById,
  fetchCampaignMembersByCampaign,
  fetchCampaignCharacters,
  fetchCharacter,
  fetchCharacterStatus,
  fetchUserCharacters,
  fetchCharacterAttributes,
  fetchAttributeKinds,
  removeCharacterFromCampaign,
  rollDifficulty as rollDifficultyRequest,
  clearDiceRolls,
  type RollDifficultyResponse,
  fetchEffects,
  createAppliedEffect,
  rollCustom,
  type RollCustomResponse,
  updateStatus,
} from "@/lib/api";
import {
  Campaign,
  CampaignMemberWithUser,
  CampaignMemberRole,
  CampaignCharacterRole,
  Character,
  CharacterType,
  CharacterPerCampaignWithCharacter,
  Attributes,
  CharacterAttribute,
  AttributeKind,
  SourceType,
} from "@/types/models";
import type { EffectDTO } from "@rpg/shared";
import { statusCacheKey } from "@/hooks/useStatus";
import {
  STATUS_ACTION_OPTIONS,
  type StatusAction,
  type StatusActionOption,
} from "./statusActions";
import StatusValuePanel from "./components/StatusValuePanel";
import AttributeTable, { AttributeRow } from "./components/AttributeTable";
import { useCampaignSocket } from "./hooks/useCampaignSocket";
import type {
  CampaignCharacterEventPayload,
  StatusUpdatedPayload,
} from "./socketTypes";

type Relation = CharacterPerCampaignWithCharacter;
const DIFFICULTY_OPTIONS = ["Fácil", "Médio", "Difícil"] as const;

const normalizeAbbreviationKey = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const ATTRIBUTE_ABBREVIATIONS: Record<string, string> = {
  forca: "FOR",
  destreza: "DES",
  destino: "DEST",
  inteligencia: "INT",
  sabedoria: "SAB",
  constituicao: "CON",
  carisma: "CAR",
  "resistencia fisica": "RF",
  "resistencia magica": "RM",
  inspiracao: "INS",
  labia: "LAB",
  percepcao: "PER",
  reflexos: "REF",
  fe: "FE",
  determinacao: "DET",
  intimidar: "INTM",
};

const resolveAbbreviation = (label: string): string => {
  const key = normalizeAbbreviationKey(label);
  if (ATTRIBUTE_ABBREVIATIONS[key]) {
    return ATTRIBUTE_ABBREVIATIONS[key];
  }
  const compact = key.replace(/[^a-z0-9]/g, "");
  const fallback = compact.slice(0, 4) || "ROL";
  return fallback.toUpperCase();
};

const getSocketUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3000`;
  }
  return "http://localhost:3000";
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

  const {
    data: campaign,
    isLoading: campaignLoading,
    error: campaignError,
  } = useSWR<Campaign>(
    campaignId ? `campaign-${campaignId}` : null,
    () => fetchCampaignById(campaignId!),
    { revalidateOnFocus: false },
  );

  const {
    data: members,
    isLoading: membersLoading,
    error: membersError,
  } = useSWR<CampaignMemberWithUser[]>(
    campaignId ? `campaign-${campaignId}-members` : null,
    () => fetchCampaignMembersByCampaign(campaignId!),
    { revalidateOnFocus: false },
  );

  const {
    data: relations,
    isLoading: relationsLoading,
    error: relationsError,
    mutate: mutateRelations,
  } = useSWR<Relation[]>(
    campaignId ? `campaign-${campaignId}-characters` : null,
    () => fetchCampaignCharacters(campaignId!),
    { revalidateOnFocus: false },
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

  const [characterMap, setCharacterMap] = useState<Record<string, Character>>(
    {},
  );
  const fetchedIdsRef = useRef<Set<string>>(new Set());
  const [charactersLoading, setCharactersLoading] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [memberCharacters, setMemberCharacters] = useState<
    Record<string, Character[]>
  >({});
  const [memberCharsLoading, setMemberCharsLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null);
  const [isAttributesOpen, setAttributesOpen] = useState(false);
  const [isDamageOpen, setDamageOpen] = useState(false);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const attributesButtonRef = useRef<HTMLButtonElement | null>(null);
  const attributesPanelRef = useRef<HTMLDivElement | null>(null);
  const damageButtonRef = useRef<HTMLButtonElement | null>(null);
  const damagePanelRef = useRef<HTMLDivElement | null>(null);
  const [selectedAttributeRow, setSelectedAttributeRow] = useState<
    string | null
  >(null);
  const [selectedExpertiseRow, setSelectedExpertiseRow] = useState<
    string | null
  >(null);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<(typeof DIFFICULTY_OPTIONS)[number]>("Médio");
  const [isRolling, setIsRolling] = useState(false);
  const [rollsByCharacter, setRollsByCharacter] = useState<
    Record<string, RollDifficultyResponse>
  >({});
  const [rollError, setRollError] = useState<string | null>(null);
  const [selectedDamageTargetId, setSelectedDamageTargetId] = useState<
    string | null
  >(null);
  const [selectedStatusAction, setSelectedStatusAction] =
    useState<StatusAction>("PHYSICAL_DAMAGE");
  const [damageFormula, setDamageFormula] = useState("");
  const [damageRoll, setDamageRoll] = useState<RollCustomResponse | null>(null);
  const [isRollingDamage, setIsRollingDamage] = useState(false);
  const [isApplyingDamage, setIsApplyingDamage] = useState(false);
  const [damageError, setDamageError] = useState<string | null>(null);
  const [damageMessage, setDamageMessage] = useState<string | null>(null);

  const socketUrl = useMemo(() => getSocketUrl(), []);

  useEffect(() => {
    if (!relations || relations.length === 0) {
      setCharactersLoading(false);
      fetchedIdsRef.current.clear();
      setCharacterMap({});
      setRollsByCharacter({});
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const activeRelations = relations.filter((rel) => !rel.deletedAt);
        const missingIds = activeRelations
          .filter(
            (rel) =>
              !rel.character && !fetchedIdsRef.current.has(rel.characterId),
          )
          .map((rel) => rel.characterId);

        if (missingIds.length === 0) {
          setCharactersLoading(false);
          return;
        }

        setCharactersLoading(true);

        const uniqueIds = Array.from(new Set(missingIds));
        const fetched = await Promise.all(
          uniqueIds.map((id) => fetchCharacter(id)),
        );

        if (!cancelled) {
          setCharacterMap((prev) => {
            const next = { ...prev };
            fetched.forEach((character) => {
              next[character.id] = character;
              fetchedIdsRef.current.add(character.id);
            });
            return next;
          });
        }
      } catch (error) {
        console.error("Erro ao carregar personagens da campanha:", error);
      } finally {
        if (!cancelled) {
          setCharactersLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [relations]);

  useEffect(() => {
    if (!focusedCardId) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const boardContains = boardRef.current?.contains(target);
      const attributesButtonContains =
        attributesButtonRef.current?.contains(target);
      const attributesPanelContains =
        attributesPanelRef.current?.contains(target);
      const damageButtonContains = damageButtonRef.current?.contains(target);
      const damagePanelContains = damagePanelRef.current?.contains(target);

      if (
        !boardContains &&
        !attributesButtonContains &&
        !attributesPanelContains &&
        !damageButtonContains &&
        !damagePanelContains
      ) {
        setFocusedCardId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [focusedCardId]);

  const activeRelations = useMemo(
    () => (relations ?? []).filter((rel) => !rel.deletedAt),
    [relations],
  );

  useEffect(() => {
    if (!activeRelations) return;
    const activeCharacterIds = new Set(
      activeRelations.map((rel) => rel.characterId),
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
  }, [activeRelations]);

  const orderedCharacters = useMemo(() => {
    return activeRelations
      .map((relation) => {
        if (relation.character) return relation.character;
        return characterMap[relation.characterId];
      })
      .filter(Boolean) as Character[];
  }, [activeRelations, characterMap]);

  const charactersById = useMemo(() => {
    const map: Record<string, Character> = {};
    orderedCharacters.forEach((character) => {
      map[character.id] = character;
    });
    return map;
  }, [orderedCharacters]);

  const effectByName = useMemo(() => {
    if (!effects || effects.length === 0) return {};
    const map: Record<string, EffectDTO> = {};
    effects.forEach((effect) => {
      if (effect.deletedAt) return;
      map[effect.name.toLowerCase()] = effect;
    });
    return map;
  }, [effects]);

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

  const playerCharacterId = useMemo(() => {
    if (!user) return null;
    return (
      orderedCharacters.find((character) => character.userId === user.id)?.id ??
      null
    );
  }, [orderedCharacters, user]);

  const sidebarCharacterId = isMaster ? focusedCardId : playerCharacterId;

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

  const sidebarCharacterKey =
    isAttributesOpen && sidebarCharacterId
      ? `character-${sidebarCharacterId}-attributes`
      : null;

  const {
    data: sidebarAttributes,
    isLoading: sidebarAttributesLoading,
    error: sidebarAttributesError,
  } = useSWR<CharacterAttribute[]>(sidebarCharacterKey, () =>
    fetchCharacterAttributes(sidebarCharacterId!),
  );

  useEffect(() => {
    if (!isMaster || !members) return;

    const userIds = members
      .map((member) => member.userId)
      .filter((id): id is string => Boolean(id));

    const missing = userIds.filter((id) => !memberCharacters[id]);

    if (missing.length === 0) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setMemberCharsLoading(true);
      try {
        const results = await Promise.all(
          missing.map(async (id) => {
            try {
              const chars = await fetchUserCharacters(id);
              return { id, chars };
            } catch (error) {
              console.error("Erro ao carregar personagens do usuário:", error);
              return { id, chars: [] as Character[] };
            }
          }),
        );

        if (cancelled) return;

        setMemberCharacters((prev) => {
          const next = { ...prev };
          results.forEach(({ id, chars }) => {
            next[id] = chars;
          });
          return next;
        });
      } finally {
        if (!cancelled) {
          setMemberCharsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isMaster, members, memberCharacters]);

  const userHasCharacter = useMemo(() => {
    if (!user) return false;
    return orderedCharacters.some((character) => character.userId === user.id);
  }, [orderedCharacters, user]);

  const usedCharacterIds = useMemo(() => {
    return new Set(activeRelations.map((rel) => rel.characterId));
  }, [activeRelations]);

  const allSelectableCharacters = useMemo(() => {
    if (!isMaster) {
      return userCharacters;
    }

    const pool = [...userCharacters, ...Object.values(memberCharacters).flat()];

    const unique = new Map(pool.map((character) => [character.id, character]));
    return Array.from(unique.values());
  }, [isMaster, memberCharacters, userCharacters]);

  const availableCharacters = useMemo(() => {
    return allSelectableCharacters.filter(
      (character) => !usedCharacterIds.has(character.id),
    );
  }, [allSelectableCharacters, usedCharacterIds]);

  const canSelect =
    campaignId &&
    !userLoading &&
    user &&
    (isMaster || (!isMaster && !userHasCharacter));

  const showPlayerSelectButton = !isMaster && canSelect;

  const loadingState =
    userLoading ||
    campaignLoading ||
    membersLoading ||
    relationsLoading ||
    charactersLoading ||
    userCharsLoading ||
    memberCharsLoading;

  const hasError = Boolean(campaignError || membersError || relationsError);

  const disableSelection =
    availableCharacters.length === 0 || loadingState || hasError;

  const openSelection = () => {
    if (disableSelection) return;
    setActionError(null);
    setIsSelecting(true);
    if (!isMaster) {
      setFocusedCardId(null);
    }
    setAttributesOpen(false);
    setDamageOpen(false);
  };

  const closeSelection = () => {
    setActionError(null);
    setIsSelecting(false);
    if (!isMaster) {
      setFocusedCardId(null);
    }
  };

  const handleAttachCharacter = async (character: Character) => {
    if (!campaignId || isSaving) return;
    if (!isMaster && userHasCharacter) {
      closeSelection();
      return;
    }

    try {
      setIsSaving(true);
      setActionError(null);

      const relation = await addCharacterToCampaign({
        campaignId,
        characterId: character.id,
        role:
          character.type === CharacterType.NPC
            ? CampaignCharacterRole.NPC
            : CampaignCharacterRole.CHARACTER,
      });

      mutateRelations(
        (current) => {
          if (!current) return [relation];
          const index = current.findIndex((item) => item.id === relation.id);
          if (index !== -1) {
            const next = [...current];
            next[index] = relation;
            return next;
          }
          return [...current, relation];
        },
        { revalidate: false },
      );
      if (relation.character) {
        const relatedCharacter = relation.character;
        fetchedIdsRef.current.add(relatedCharacter.id);
        setCharacterMap((prev) => ({
          ...prev,
          [relatedCharacter.id]: relatedCharacter,
        }));
      }
      closeSelection();
    } catch (error) {
      console.error("Falha ao vincular personagem:", error);
      setActionError("Não foi possível adicionar o personagem.");
    } finally {
      setIsSaving(false);
    }
  };

  const relationsByCharacterId = useMemo(() => {
    const map: Record<string, Relation> = {};
    activeRelations.forEach((relation) => {
      map[relation.characterId] = relation;
    });
    return map;
  }, [activeRelations]);

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

  const attributePanelLoading =
    Boolean(isAttributesOpen && sidebarCharacterId) &&
    (sidebarAttributesLoading ||
      !attributeDefinitions ||
      !expertiseDefinitions);

  useEffect(() => {
    setSelectedAttributeRow(null);
    setSelectedExpertiseRow(null);
  }, [sidebarCharacterId]);

  useEffect(() => {
    setRollError(null);
  }, [sidebarCharacterId]);

  useEffect(() => {
    if (isDamageOpen) return;
    setDamageRoll(null);
    setDamageMessage(null);
    setDamageError(null);
    setIsRollingDamage(false);
    setIsApplyingDamage(false);
  }, [isDamageOpen]);

  useEffect(() => {
    if (!isDamageOpen) return;

    if (
      selectedDamageTargetId &&
      orderedCharacters.some(
        (character) => character.id === selectedDamageTargetId,
      )
    ) {
      return;
    }

    if (
      focusedCardId &&
      orderedCharacters.some((character) => character.id === focusedCardId)
    ) {
      setSelectedDamageTargetId(focusedCardId);
      return;
    }

    if (orderedCharacters.length > 0) {
      setSelectedDamageTargetId(orderedCharacters[0].id);
    } else {
      setSelectedDamageTargetId(null);
    }
  }, [focusedCardId, isDamageOpen, orderedCharacters, selectedDamageTargetId]);

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
        const character = payload.relation.character;
        fetchedIdsRef.current.add(character.id);
        setCharacterMap((prev) => ({
          ...prev,
          [character.id]: character,
        }));
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
      setRollsByCharacter((prev) => {
        const characterId = payload.relation.characterId;
        if (!characterId || !(characterId in prev)) return prev;
        const next = { ...prev };
        delete next[characterId];
        return next;
      });
    },
    [campaignId, mutateRelations],
  );

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
      onDiceRolled: handleDiceRolled,
      onDiceCleared: handleDiceCleared,
      onCharacterLinked: handleCharacterLinked,
      onCharacterUnlinked: handleCharacterUnlinked,
      onStatusUpdated: handleStatusUpdated,
    }),
    [
      handleDiceRolled,
      handleDiceCleared,
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
  const selectedRollRow = useMemo(() => {
    if (!attributeTables) return null;

    if (selectedAttributeRow) {
      const match = attributeTables.attributes.find(
        (row) => row.name === selectedAttributeRow,
      );
      if (match) {
        return { ...match, kind: "attribute" as const };
      }
    }

    if (selectedExpertiseRow) {
      const match = attributeTables.expertises.find(
        (row) => row.name === selectedExpertiseRow,
      );
      if (match) {
        return { ...match, kind: "expertise" as const };
      }
    }

    return null;
  }, [attributeTables, selectedAttributeRow, selectedExpertiseRow]);

  const sidebarRoll = useMemo(() => {
    if (!sidebarCharacterId) return null;
    return rollsByCharacter[sidebarCharacterId] ?? null;
  }, [rollsByCharacter, sidebarCharacterId]);

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

  const handleDetachCharacter = async (relation: Relation) => {
    if (removingId) return;

    try {
      setRemovingId(relation.id);
      setActionError(null);
      const removedRelation = await removeCharacterFromCampaign(relation.id);
      mutateRelations(
        (current) => {
          if (!current) return current;
          const index = current.findIndex(
            (item) => item.id === removedRelation.id,
          );
          if (index === -1) return current;
          const next = [...current];
          next[index] = removedRelation;
          return next;
        },
        { revalidate: false },
      );
      setRollsByCharacter((prev) => {
        const characterId = removedRelation.characterId;
        if (!characterId || !(characterId in prev)) return prev;
        const next = { ...prev };
        delete next[characterId];
        return next;
      });
      if (focusedCardId === relation.characterId) {
        setFocusedCardId(null);
      }
    } catch (error) {
      console.error("Falha ao remover personagem:", error);
      setActionError("Não foi possível remover o personagem.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearRolls = async () => {
    if (!isMaster || !campaignId || activeRollEntries.length === 0) return;
    try {
      await clearDiceRolls(campaignId);
      setRollsByCharacter({});
      setRollError(null);
    } catch (error) {
      console.error("Falha ao limpar rolagens:", error);
      setRollError("Não foi possível limpar as rolagens agora.");
    }
  };

  const handleRollDamage = async () => {
    if (!damageFormula.trim()) {
      setDamageError("Informe uma fórmula antes de rolar.");
      return;
    }
    try {
      setIsRollingDamage(true);
      setDamageError(null);
      setDamageMessage(null);
      const result = await rollCustom(damageFormula);
      setDamageRoll(result);
      setDamageMessage(`Rolagem concluída. Total: ${result.total}.`);
    } catch (error) {
      console.error("Falha ao rolar alteração de status:", error);
      setDamageRoll(null);
      setDamageMessage(null);
      setDamageError("Não foi possível rolar essa fórmula agora.");
    } finally {
      setIsRollingDamage(false);
    }
  };

  const handleResetDamage = () => {
    setDamageRoll(null);
    setDamageMessage(null);
    setDamageError(null);
    setDamageFormula("");
  };

  const handleApplyDamage = async () => {
    if (!isMaster) return;
    if (!selectedDamageTargetId) {
      setDamageError("Selecione um alvo para aplicar a alteração.");
      return;
    }
    if (!damageRoll) {
      setDamageError("Realize uma rolagem antes de aplicar a alteração.");
      return;
    }
    if (effectsLoading) {
      setDamageError("Os efeitos ainda estão carregando. Tente novamente.");
      return;
    }
    const actionConfig = selectedActionConfig;
    if (!actionConfig) {
      setDamageError("Selecione um tipo de alteração válido.");
      return;
    }
    const effect = effectByName[actionConfig.effectName.toLowerCase()];
    if (!effect) {
      setDamageError(
        "Nenhum efeito configurado foi encontrado para esse tipo de alteração.",
      );
      return;
    }

    const roundedTotal = Math.round(damageRoll.total);
    const amount = Math.max(0, Math.abs(roundedTotal));

    if (!Number.isFinite(amount)) {
      setDamageError("Valor inválido.");
      return;
    }

    const effectValue = actionConfig.isIncrease ? amount : -amount;

    try {
      setIsApplyingDamage(true);
      setDamageError(null);

      await createAppliedEffect({
        characterId: selectedDamageTargetId,
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
        const statusList = await fetchCharacterStatus(selectedDamageTargetId);
        const targetStatus = statusList.find(
          (status) =>
            status.name.toLowerCase() ===
            actionConfig.targetStatus.toLowerCase(),
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
          const cacheKey = statusCacheKey(selectedDamageTargetId);
          if (cacheKey) {
            await mutateCache(cacheKey, updatedStatuses, { revalidate: false });
          }
          const roundedNext = Math.round(nextValue);
          const roundedMax =
            safeMax > 0
              ? Math.round(safeMax)
              : Math.round(Math.max(currentValue, nextValue));
          statusMessage = ` ${actionConfig.targetStatus} atual: ${roundedNext}/${roundedMax}.`;
        } else {
          statusMessage = ` (Status de ${actionConfig.targetStatus} não encontrado para atualizar automaticamente.)`;
        }
      } catch (statusError) {
        console.error("Falha ao atualizar status:", statusError);
        statusMessage =
          " (Efeito registrado, mas não foi possível atualizar o status automaticamente.)";
      }

      const target = charactersById[selectedDamageTargetId];
      const baseMessage = target
        ? `${actionConfig.label} (${amount}) em ${target.name}`
        : `${actionConfig.label} (${amount})`;
      setDamageMessage(`${baseMessage}.${statusMessage}`);
      setDamageRoll(null);
    } catch (error) {
      console.error("Falha ao aplicar alteração de status:", error);
      setDamageError("Não foi possível aplicar a alteração agora.");
    } finally {
      setIsApplyingDamage(false);
    }
  };

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

  const selectedActionConfig = useMemo<StatusActionOption>(() => {
    return (
      STATUS_ACTION_OPTIONS.find(
        (option) => option.value === selectedStatusAction,
      ) ?? STATUS_ACTION_OPTIONS[0]
    );
  }, [selectedStatusAction]);

  const selectedEffectAvailable = Boolean(
    selectedActionConfig &&
      effectByName[selectedActionConfig.effectName.toLowerCase()],
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

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <button
            ref={attributesButtonRef}
            type="button"
            onClick={() => {
              if (isMaster && focusedCardId) {
                setDamageOpen(false);
                setAttributesOpen((prev) => !prev);
                return;
              }

              if (isMaster && !focusedCardId && orderedCharacters.length > 0) {
                setFocusedCardId(orderedCharacters[0].id);
              }

              if (!isMaster && playerCharacterId) {
                setFocusedCardId(playerCharacterId);
              }
              setDamageOpen(false);
              setAttributesOpen((prev) => !prev);
            }}
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
            ref={damageButtonRef}
            type="button"
            onClick={() => {
              if (isMaster && focusedCardId) {
                setAttributesOpen(false);
                setDamageOpen((prev) => !prev);
                return;
              }

              if (isMaster && !focusedCardId && orderedCharacters.length > 0) {
                setFocusedCardId(orderedCharacters[0].id);
              }

              if (!isMaster && playerCharacterId) {
                setFocusedCardId(playerCharacterId);
              }
              setAttributesOpen(false);
              setDamageOpen((prev) => !prev);
            }}
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

        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Hub da campanha
            </p>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">
                {campaign?.name ?? "Carregando"}
              </h1>
              {isMaster && (
                <span className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                  Master view
                </span>
              )}
            </div>
          </div>

          {!isSelecting && showPlayerSelectButton && (
            <button
              type="button"
              disabled={disableSelection}
              onClick={openSelection}
              className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isMaster ? "Adicionar personagem" : "Vincular personagem"}
            </button>
          )}
        </header>

        {hasError && (
          <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Falha ao carregar dados da campanha.
          </div>
        )}

        {isAttributesOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setAttributesOpen(false)}
            ></div>
            <aside
              ref={attributesPanelRef}
              className="fixed left-0 top-0 z-50 flex h-full w-[360px] flex-col bg-slate-900/95 text-slate-100 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <span className="text-sm font-semibold uppercase tracking-wide text-slate-200">
                  Atributos
                </span>
                <button
                  type="button"
                  onClick={() => setAttributesOpen(false)}
                  className="rounded-full bg-slate-800 px-2 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
                >
                  Fechar
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-slate-200">
                {!sidebarCharacterId ? (
                  <p className="text-sm text-slate-300">
                    {isMaster
                      ? "Selecione um personagem no quadro para visualizar os atributos."
                      : "Nenhum personagem associado foi encontrado para esta campanha."}
                  </p>
                ) : attributePanelLoading ? (
                  <div className="flex items-center justify-center py-10 text-sm text-slate-300">
                    Carregando atributos...
                  </div>
                ) : sidebarAttributesError ? (
                  <p className="text-sm text-red-300">
                    Não foi possível carregar os atributos.
                  </p>
                ) : attributeTables ? (
                  <>
                    <h3 className="mb-4 text-lg font-semibold text-white">
                      {sidebarCharacter?.name}
                      {sidebarCharacter?.userId === user?.id ? " •" : ""}
                    </h3>

                    <AttributeTable
                      title="Atributos"
                      firstColumnLabel="Atributo"
                      rows={attributeTables.attributes}
                      headerClass="bg-red-600"
                      selectedRowName={selectedAttributeRow}
                      onSelectRow={(rowName) => {
                        setSelectedExpertiseRow(null);
                        setSelectedAttributeRow((prev) =>
                          prev === rowName ? null : rowName,
                        );
                      }}
                    />

                    <AttributeTable
                      title="Perícias"
                      firstColumnLabel="Perícia"
                      rows={attributeTables.expertises}
                      headerClass="bg-sky-600"
                      selectedRowName={selectedExpertiseRow}
                      onSelectRow={(rowName) => {
                        setSelectedAttributeRow(null);
                        setSelectedExpertiseRow((prev) =>
                          prev === rowName ? null : rowName,
                        );
                      }}
                    />

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        disabled={!selectedRollRow || isRolling}
                        onClick={async () => {
                          if (
                            !selectedRollRow ||
                            !sidebarCharacterId ||
                            !campaignId
                          )
                            return;
                          const diceCount = Math.max(
                            1,
                            Math.floor(selectedRollRow.total),
                          );
                          const attributeAbbreviation = resolveAbbreviation(
                            selectedRollRow.name,
                          );
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
                            setRollsByCharacter((prev) => ({
                              ...prev,
                              [result.characterId]: result,
                            }));
                            if (process.env.NODE_ENV !== "production") {
                              console.debug(
                                `Rolagem ${attributeAbbreviation} (${selectedDifficulty}) → Sucessos: ${result.successes}/${result.diceCount}`,
                                result.rolls,
                              );
                            }
                          } catch (error) {
                            console.error("Falha ao rolar dados:", error);
                            setRollError(
                              "Não foi possível rolar os dados agora.",
                            );
                          } finally {
                            setIsRolling(false);
                          }
                        }}
                        className="inline-flex w-full items-center justify-center rounded-lg border border-white/10 bg-blue-600/80 px-3 py-1.5 text-sm font-semibold text-white shadow transition hover:bg-blue-500/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/10 disabled:text-slate-400 sm:w-auto sm:px-4"
                      >
                        {isRolling
                          ? "Rolando..."
                          : selectedRollRow
                            ? `Rolar ${selectedRollRow.name}`
                            : "Rolar Atributo"}
                      </button>

                      <div className="relative w-full sm:w-40">
                        <select
                          value={selectedDifficulty}
                          onChange={(event) =>
                            setSelectedDifficulty(
                              event.target
                                .value as (typeof DIFFICULTY_OPTIONS)[number],
                            )
                          }
                          className="block w-full appearance-none rounded-lg border border-white/10 bg-slate-900/60 px-4 py-2 text-sm font-medium text-white shadow focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          {DIFFICULTY_OPTIONS.map((label) => (
                            <option key={label} value={label}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/70">
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6 8l4 4 4-4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>

                    {rollError && (
                      <p className="mt-2 text-sm text-red-300">{rollError}</p>
                    )}

                    {sidebarRoll && (
                      <div className="mt-3 space-y-1 rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-slate-200">
                        <p className="font-semibold text-white">
                          {sidebarRoll.attributeAbbreviation} • Sucessos{" "}
                          {sidebarRoll.successes}/{sidebarRoll.diceCount}
                        </p>
                        <p className="uppercase tracking-wide text-white/70">
                          {sidebarRoll.attributeName}
                        </p>
                        <p>
                          Rolagens:{" "}
                          {sidebarRoll.rolls.length > 0
                            ? sidebarRoll.rolls.join(", ")
                            : "—"}
                        </p>
                        <p>
                          Dificuldade {sidebarRoll.difficulty} • Limiar ≥{" "}
                          {sidebarRoll.threshold}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate-300">
                    Nenhum dado de atributos disponível.
                  </p>
                )}
              </div>
            </aside>
          </>
        )}

        <StatusValuePanel
          isOpen={isDamageOpen}
          onClose={() => setDamageOpen(false)}
          panelRef={damagePanelRef}
          isMaster={isMaster}
          characters={orderedCharacters}
          selectedTargetId={selectedDamageTargetId}
          onSelectTarget={(value) => {
            setSelectedDamageTargetId(value);
            setDamageError(null);
            setDamageMessage(null);
          }}
          selectedAction={selectedStatusAction}
          onSelectAction={(value) => {
            setSelectedStatusAction(value);
            setDamageError(null);
            setDamageMessage(null);
          }}
          actionOptions={STATUS_ACTION_OPTIONS}
          damageFormula={damageFormula}
          onChangeFormula={(value) => {
            setDamageFormula(value);
            setDamageError(null);
          }}
          onRoll={handleRollDamage}
          onReset={handleResetDamage}
          onApply={handleApplyDamage}
          isRolling={isRollingDamage}
          isApplying={isApplyingDamage}
          damageRoll={damageRoll}
          damageError={damageError}
          damageMessage={damageMessage}
          effectsLoading={effectsLoading}
          effectsError={
            effectsError
              ? ((effectsError as Error).message ?? "Erro ao carregar")
              : null
          }
          effectAvailable={selectedEffectAvailable}
          activeRollsContent={activeRollsContent}
        />

        {isSelecting ? (
          <section
            className={`rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-lg backdrop-blur ${
              isAttributesOpen ? "ml-[360px]" : ""
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">Escolha um personagem</h2>
              <button
                type="button"
                onClick={closeSelection}
                className="text-sm text-slate-400 hover:text-slate-200"
              >
                Cancelar
              </button>
            </div>

            {availableCharacters.length === 0 ? (
              <p className="text-sm text-slate-400">
                Nenhum personagem disponível.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableCharacters.map((character) => (
                  <div
                    key={character.id}
                    className="rounded-xl border border-white/5 bg-white/[0.04] p-2 transition hover:border-white/20"
                  >
                    <CharacterCard
                      character={character}
                      onClick={() => {
                        if (isSaving) return;
                        handleAttachCharacter(character);
                      }}
                      nameSuffix={
                        character.userId === user?.id ? "•" : undefined
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {actionError && (
              <p className="mt-4 text-sm text-red-200">{actionError}</p>
            )}
          </section>
        ) : (
          <section className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-lg backdrop-blur">
            {isMaster && (
              <button
                type="button"
                onClick={openSelection}
                disabled={disableSelection}
                className="absolute right-6 top-6 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 p-2 text-xs font-medium text-slate-200 opacity-60 transition hover:border-white/40 hover:text-white hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/20"
                aria-label="Adicionar personagem"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            {loadingState ? (
              <div className="flex justify-center py-12">
                <p className="text-sm text-slate-400">Carregando quadro...</p>
              </div>
            ) : orderedCharacters.length === 0 ? (
              <div className="flex justify-center py-12">
                <p className="text-sm text-slate-400">
                  Nenhum personagem vinculado.
                </p>
              </div>
            ) : (
              <div className="flex justify-center">
                <div
                  ref={boardRef}
                  className="grid grid-rows-2 grid-flow-col auto-cols-[minmax(240px,240px)] gap-x-4 gap-y-4 justify-items-center px-2"
                >
                  {orderedCharacters.map((character) => {
                    const isOwner = character.userId === user?.id;
                    const relation = relationsByCharacterId[character.id];
                    const characterRoll = rollsByCharacter[character.id];
                    const cardRollSummary = characterRoll
                      ? {
                          label: characterRoll.attributeAbbreviation,
                          successes: characterRoll.successes,
                        }
                      : null;

                    return (
                      <div
                        key={character.id}
                        className={`group relative rounded-xl border border-white/10 p-1 transition-transform duration-200 ${
                          focusedCardId === character.id
                            ? "bg-slate-100 ring-4 ring-blue-400 ring-offset-2 ring-offset-slate-950 shadow-xl"
                            : focusedCardId
                              ? "bg-slate-950/70 opacity-50 hover:opacity-80"
                              : "bg-slate-900/40"
                        }`}
                      >
                        {isMaster && relation && (
                          <button
                            type="button"
                            className={`absolute right-2 top-2 inline-flex items-center justify-center rounded-full bg-red-600/90 p-[3px] text-red-100 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-wait disabled:bg-red-700/60 disabled:text-red-200 ${removingId === relation.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"} z-20`}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDetachCharacter(relation);
                            }}
                            disabled={removingId === relation.id}
                            aria-label="Remover personagem da campanha"
                          >
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M4 6h16M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V6h10Z"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        )}

                        <CharacterCard
                          character={character}
                          onClick={() =>
                            setFocusedCardId((prev) =>
                              prev === character.id ? null : character.id,
                            )
                          }
                          disableHoverEffect
                          className="h-full"
                          nameSuffix={isOwner ? "•" : undefined}
                          rollSummary={cardRollSummary}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}
        {actionError && !isSelecting && (
          <p className="text-sm text-red-200">{actionError}</p>
        )}
      </div>
    </main>
  );
}
