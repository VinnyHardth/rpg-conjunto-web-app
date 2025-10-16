import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (!campaignId) {
      setIsLoading(false);
      setError("ID da campanha não encontrado.");
      return;
    }

    const loadCampaignData = async () => {
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
    };

    loadCampaignData();
  }, [campaignId]);

  return { campaign, members, relations, isLoading, error, setRelations };
}
