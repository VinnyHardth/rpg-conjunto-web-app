import { useState, useEffect, useCallback } from "react";
import {
  fetchCampaignById,
  fetchCampaignMembersByCampaign,
  fetchCampaignCharacters,
} from "@/lib/api";
import {
  Campaign,
  CampaignMemberWithUser,
  CharacterPerCampaignWithCharacter,
} from "@/types/models";

type Relation = CharacterPerCampaignWithCharacter;

export function useCampaignData(campaignId: string | undefined) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [members, setMembers] = useState<CampaignMemberWithUser[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCampaignData = useCallback(async () => {
    if (!campaignId) {
      setCampaign(null);
      setMembers([]);
      setRelations([]);
      setIsLoading(false);
      setError("ID da campanha não encontrado.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [campaignData, memberList, relationsData] = await Promise.all([
        fetchCampaignById(campaignId),
        fetchCampaignMembersByCampaign(campaignId),
        fetchCampaignCharacters(campaignId),
      ]);

      setCampaign(campaignData);
      setMembers(memberList);
      setRelations(relationsData);
    } catch (err) {
      console.error("Erro ao carregar dados da campanha:", err);
      setError("Não foi possível carregar os dados da campanha.");
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  const refreshRelations = useCallback(async () => {
    if (!campaignId) {
      return;
    }

    try {
      const relationsData = await fetchCampaignCharacters(campaignId);
      setRelations(relationsData);
    } catch (err) {
      console.error("Erro ao atualizar personagens da campanha:", err);
      setError(
        (prev) =>
          prev ?? "Não foi possível atualizar os personagens da campanha.",
      );
    }
  }, [campaignId]);

  useEffect(() => {
    void loadCampaignData();
  }, [loadCampaignData]);

  return {
    campaign,
    members,
    relations,
    isLoading,
    error,
    setRelations,
    refreshRelations,
    reloadCampaignData: loadCampaignData,
  };
}
