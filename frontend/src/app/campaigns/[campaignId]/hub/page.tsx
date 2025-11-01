"use client";

import { useParams } from "next/navigation";

import { CampaignHubProvider } from "./contexts/CampaignHubContext";
import CampaignHubLayout from "./components/CampaignHubLayout";
import { useCampaignHubPage } from "./hooks/useCampaignHubPage";

export default function CampaignHubByIdPage() {
  const params = useParams();
  const campaignIdParam = params?.campaignId;
  const campaignId = Array.isArray(campaignIdParam)
    ? campaignIdParam[0]
    : campaignIdParam;

  const {
    campaignId: resolvedCampaignId,
    user,
    userLoading,
    providerValue,
    layoutProps,
  } = useCampaignHubPage(campaignId);

  if (!resolvedCampaignId) {
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
    <CampaignHubProvider value={providerValue}>
      <CampaignHubLayout {...layoutProps} />
    </CampaignHubProvider>
  );
}
