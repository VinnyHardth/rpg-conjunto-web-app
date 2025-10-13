"use client";

import React from "react";

import { CampaignMemberRole } from "@/types/models";
import { useCampaigns } from "@/hooks/useCampaigns";
import CampaignCard from "./CampaignCard";

interface CampaignListModelProps {
  userId: string;
  onSelectCampaign?: (campaignId: string) => void;
}

const LoadingCampaignsPlaceholder = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
    Carregando campanhas...
  </div>
);

const EmptyCampaignsPlaceholder = () => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 p-10 text-center shadow-sm">
    <span className="text-4xl" role="img" aria-label="Mapa do tesouro">
      🗺️
    </span>
    <h3 className="text-lg font-semibold text-blue-900">
      Você ainda não participa de campanhas
    </h3>
    <p className="max-w-md text-sm text-blue-700">
      Crie uma nova campanha ou peça para um mestre enviar o link de convite
      para começar a aventura em grupo.
    </p>
  </div>
);

export default function CampaignListModel({
  userId,
  onSelectCampaign,
}: CampaignListModelProps) {
  const { campaigns, isLoading, error } = useCampaigns(userId);

  if (!userId) {
    return null;
  }

  if (isLoading) {
    return <LoadingCampaignsPlaceholder />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        Ocorreu um erro ao carregar suas campanhas. Tente novamente mais tarde.
      </div>
    );
  }

  if (campaigns.length === 0) {
    return <EmptyCampaignsPlaceholder />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {campaigns.map(({ campaign, role }) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            isMaster={role === CampaignMemberRole.MASTER}
            onClick={
              onSelectCampaign ? () => onSelectCampaign(campaign.id) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
