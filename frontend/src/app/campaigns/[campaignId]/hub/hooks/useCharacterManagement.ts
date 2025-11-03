import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  addCharacterToCampaign,
  fetchCharacter,
  fetchUserCharacters,
  removeCharacterFromCampaign,
} from "@/lib/api";
import type {
  Character,
  CharacterPerCampaignWithCharacter,
  User,
} from "@/types/models";
import { CampaignCharacterRole } from "@/types/models";
import { CharacterType } from "@/types/models";

type Relation = CharacterPerCampaignWithCharacter;

interface UseCharacterManagementProps {
  campaignId: string;
  relations: Relation[];
  mutateRelations: (
    updater: Relation[] | ((current: Relation[]) => Relation[]),
    options?: { revalidate: boolean },
  ) => void;
  isMaster: boolean;
  user: User | null;
  userCharacters: Character[];
  memberIds: string[];
  onRecover?: () => void | Promise<void>;
}

export function useCharacterManagement({
  campaignId,
  relations,
  mutateRelations,
  isMaster,
  user,
  userCharacters,
  memberIds,
  onRecover,
}: UseCharacterManagementProps) {
  const [characterMap, setCharacterMap] = useState<Record<string, Character>>(
    {},
  );
  const fetchedIdsRef = useRef<Set<string>>(new Set());
  const [charactersLoading, setCharactersLoading] = useState(false);

  const [memberCharacters, setMemberCharacters] = useState<
    Record<string, Character[]>
  >({});
  const [memberCharsLoading, setMemberCharsLoading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const activeRelations = useMemo(
    () => (relations ?? []).filter((rel) => !rel.deletedAt),
    [relations],
  );

  // Efeito para buscar detalhes dos personagens que estão na campanha
  useEffect(() => {
    if (!relations) return;

    let isCancelled = false;

    const loadMissingCharacters = async () => {
      const missingIds = activeRelations
        .filter(
          (rel) =>
            !rel.character && !fetchedIdsRef.current.has(rel.characterId),
        )
        .map((rel) => rel.characterId);

      if (missingIds.length === 0) return;

      setCharactersLoading(true);
      try {
        const fetched = await Promise.all(
          Array.from(new Set(missingIds)).map((id) => fetchCharacter(id)),
        );
        if (!isCancelled) {
          setCharacterMap((prev) => {
            const next = { ...prev };
            fetched.forEach((char) => {
              next[char.id] = char;
              fetchedIdsRef.current.add(char.id);
            });
            return next;
          });
        }
      } catch (error) {
        console.error("Erro ao carregar personagens da campanha:", error);
      } finally {
        if (!isCancelled) {
          setCharactersLoading(false);
        }
      }
    };

    loadMissingCharacters();

    return () => {
      isCancelled = true;
    };
  }, [activeRelations, relations]);

  // Efeito para buscar os personagens dos membros da campanha (visão do mestre)
  useEffect(() => {
    if (!isMaster || memberIds.length === 0) return;

    let isCancelled = false;

    const loadMemberCharacters = async () => {
      const missingUserIds = memberIds.filter((id) => !memberCharacters[id]);
      if (missingUserIds.length === 0) return;

      setMemberCharsLoading(true);
      try {
        const results = await Promise.all(
          missingUserIds.map(async (id) => ({
            id,
            chars: await fetchUserCharacters(id),
          })),
        );
        if (!isCancelled) {
          setMemberCharacters((prev) => {
            const next = { ...prev };
            results.forEach(({ id, chars }) => (next[id] = chars));
            return next;
          });
        }
      } catch (error) {
        console.error("Erro ao carregar personagens dos membros:", error);
      } finally {
        if (!isCancelled) {
          setMemberCharsLoading(false);
        }
      }
    };

    loadMemberCharacters();

    return () => {
      isCancelled = true;
    };
  }, [isMaster, memberIds, memberCharacters]);

  const orderedCharacters = useMemo(() => {
    return activeRelations
      .map(
        (relation) => relation.character ?? characterMap[relation.characterId],
      )
      .filter(Boolean) as Character[];
  }, [activeRelations, characterMap]);

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

  const handleAttachCharacter = useCallback(
    async (character: Character) => {
      if (!campaignId || isSaving) return;
      if (!isMaster && userHasCharacter) {
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
      } catch (error) {
        console.error("Falha ao vincular personagem:", error);
        setActionError("Não foi possível adicionar o personagem.");
        if (onRecover) {
          await onRecover();
        }
        throw error; // Re-throw para que o chamador possa lidar com isso (ex: não fechar o modal)
      } finally {
        setIsSaving(false);
      }
    },
    [
      campaignId,
      isSaving,
      isMaster,
      userHasCharacter,
      mutateRelations,
      onRecover,
    ],
  );

  const handleDetachCharacter = useCallback(
    async (relation: Relation) => {
      if (removingId) return;

      try {
        setRemovingId(relation.id);
        setActionError(null);
        const removedRelation = await removeCharacterFromCampaign(relation.id);
        mutateRelations(
          (current) =>
            current?.map((item) => {
              if (item.id === removedRelation.id) return removedRelation;
              if (item.characterId === removedRelation.characterId)
                return removedRelation;
              return item;
            }) ?? [],
          { revalidate: false },
        );
      } catch (error) {
        console.error("Falha ao remover personagem:", error);
        setActionError("Não foi possível remover o personagem.");
        if (onRecover) {
          await onRecover();
        }
      } finally {
        setRemovingId(null);
      }
    },
    [removingId, mutateRelations, onRecover],
  );

  return useMemo(
    () => ({
      orderedCharacters,
      characterMap,
      charactersLoading,
      memberCharsLoading,
      availableCharacters,
      userHasCharacter,
      isSaving,
      removingId,
      actionError,
      handleAttachCharacter,
      handleDetachCharacter,
    }),
    [
      orderedCharacters,
      characterMap,
      charactersLoading,
      memberCharsLoading,
      availableCharacters,
      userHasCharacter,
      isSaving,
      removingId,
      actionError,
      handleAttachCharacter,
      handleDetachCharacter,
    ],
  );
}
