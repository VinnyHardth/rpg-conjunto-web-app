import useSWR from "swr";

import type { Campaign, CreateCampaign } from "@/types/models";
import { CampaignMemberRole } from "@/types/models";
import {
  createCampaign as apiCreateCampaign,
  fetchCampaignById,
  fetchCampaignMembersByUser,
  fetchCampaignsByCreator,
} from "@/lib/api";

export interface CampaignWithRole {
  campaign: Campaign;
  role: CampaignMemberRole;
}

const fetchUserCampaigns = async (
  userId: string,
): Promise<CampaignWithRole[]> => {
  const [createdCampaigns, memberships] = await Promise.all([
    fetchCampaignsByCreator(userId),
    fetchCampaignMembersByUser(userId),
  ]);

  const campaignsMap = new Map<string, CampaignWithRole>();

  createdCampaigns.forEach((campaign) => {
    campaignsMap.set(campaign.id, {
      campaign,
      role: CampaignMemberRole.MASTER,
    });
  });

  const membershipRoles = new Map<string, CampaignMemberRole>();
  memberships.forEach((member) => {
    const existing = campaignsMap.get(member.campaignId);
    if (existing) {
      const role =
        member.role === CampaignMemberRole.MASTER
          ? CampaignMemberRole.MASTER
          : existing.role;
      campaignsMap.set(member.campaignId, {
        campaign: existing.campaign,
        role,
      });
    } else if (!membershipRoles.has(member.campaignId)) {
      membershipRoles.set(member.campaignId, member.role);
    }
  });

  const missingCampaigns = Array.from(membershipRoles.entries());
  if (missingCampaigns.length > 0) {
    const fetched = await Promise.all(
      missingCampaigns.map(async ([campaignId, role]) => {
        try {
          const campaign = await fetchCampaignById(campaignId);
          return { campaign, role } as CampaignWithRole;
        } catch (error) {
          console.error(
            `Não foi possível carregar a campanha ${campaignId}:`,
            error,
          );
          return null;
        }
      }),
    );

    fetched
      .filter((entry): entry is CampaignWithRole => entry !== null)
      .forEach((entry) => {
        const existing = campaignsMap.get(entry.campaign.id);
        if (existing && existing.role === CampaignMemberRole.MASTER) {
          return;
        }
        campaignsMap.set(entry.campaign.id, entry);
      });
  }

  return Array.from(campaignsMap.values());
};

export function useCampaigns(userId?: string) {
  const { data, error, isLoading, mutate } = useSWR<CampaignWithRole[]>(
    userId ? (["userCampaigns", userId] as const) : null,
    () => fetchUserCampaigns(userId!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    },
  );

  const createCampaign = async (payload: CreateCampaign): Promise<Campaign> => {
    const campaign = await apiCreateCampaign(payload);
    const entry: CampaignWithRole = {
      campaign,
      role: CampaignMemberRole.MASTER,
    };

    await mutate((current) => (current ? [...current, entry] : [entry]), {
      revalidate: false,
    });

    return campaign;
  };

  return {
    campaigns: data ?? [],
    isLoading,
    error: error as Error | null,
    createCampaign,
    refreshCampaigns: mutate,
  };
}
