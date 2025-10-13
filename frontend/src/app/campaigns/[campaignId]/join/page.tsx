"use client";

/* eslint-disable @next/next/no-img-element */

import React, { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { User } from "@/types/models";
import {
  Campaign,
  CampaignMemberWithUser,
  CampaignMemberRole,
} from "@/types/models";
import { useUser } from "@/hooks/useUser";
import {
  addCampaignMember,
  fetchCampaignById,
  fetchCampaignMembersByCampaign,
  fetchUserById,
} from "@/lib/api";

type PageProps = {
  params: Promise<{
    campaignId: string;
  }>;
};

export default function CampaignJoinPage({ params }: PageProps) {
  const campaignId = use(params).campaignId;
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [members, setMembers] = useState<CampaignMemberWithUser[]>([]);
  const [creatorUser, setCreatorUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  useEffect(() => {
    const loadCampaign = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [campaignData, memberList] = await Promise.all([
          fetchCampaignById(campaignId),
          fetchCampaignMembersByCampaign(campaignId),
        ]);

        setCampaign(campaignData);
        setMembers(memberList);

        const creatorMember = memberList.find(
          (member) => member.userId === campaignData.creatorId,
        );

        if (creatorMember?.user) {
          setCreatorUser(creatorMember.user);
        } else {
          try {
            const creator = await fetchUserById(campaignData.creatorId);
            setCreatorUser(creator);
          } catch (fetchError) {
            console.error(
              "Não foi possível carregar o mestre da campanha:",
              fetchError,
            );
          }
        }
      } catch (err) {
        console.error("Erro ao carregar campanha:", err);
        setError("Não foi possível carregar os dados da campanha.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaign();
  }, [campaignId]);

  const membership = useMemo(() => {
    if (!user) return null;

    const existing = members.find((member) => member.userId === user.id);
    if (existing) return existing;

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

  const participants = useMemo(() => {
    if (!campaign) return members;

    const list = [...members];
    const hasCreator = list.some(
      (member) => member.userId === campaign.creatorId,
    );

    if (!hasCreator) {
      list.unshift({
        id: `creator-${campaign.id}`,
        campaignId: campaign.id,
        userId: campaign.creatorId,
        role: CampaignMemberRole.MASTER,
        status: "ACTIVE",
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        deletedAt: null,
        user: creatorUser ?? null,
      });
    }

    return list;
  }, [members, campaign, creatorUser]);

  const handleJoin = async () => {
    if (!user || !campaign || membership) return;

    setIsJoining(true);
    setError(null);

    try {
      await addCampaignMember({
        campaignId: campaign.id,
        userId: user.id,
        role: CampaignMemberRole.PLAYER,
        status: "ACTIVE",
      });
      const updatedMembers = await fetchCampaignMembersByCampaign(campaign.id);
      setMembers(updatedMembers);
      setJoinSuccess(true);
    } catch (err) {
      console.error("Erro ao entrar na campanha:", err);
      setError(
        "Não foi possível entrar na campanha. Tente novamente mais tarde.",
      );
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading || userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="rounded-xl border border-gray-200 bg-white px-8 py-6 text-gray-600 shadow-sm">
          Carregando informações da campanha...
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 px-8 py-6 text-red-700 shadow-sm">
          {error || "Campanha não encontrada."}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="max-w-lg rounded-xl border border-yellow-200 bg-yellow-50 px-8 py-6 text-center text-yellow-800 shadow-sm">
          <p>Você precisa estar autenticado para entrar em uma campanha.</p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-4 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600"
          >
            Ir para login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="relative h-56 w-full bg-gray-200">
            <img
              src={
                campaign.imageUrl ||
                "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
              }
              alt={campaign.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-4 px-6 py-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {campaign.name}
              </h1>
              {isMaster && (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                  Mestre
                </span>
              )}
            </div>

            {campaign.description && (
              <p className="text-sm text-gray-600">{campaign.description}</p>
            )}

            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              Atualmente{" "}
              <strong>
                {participants.length} aventureiro
                {participants.length === 1 ? "" : "s"}
              </strong>{" "}
              participam desta campanha.
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {membership ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Você já participa desta campanha como{" "}
                <strong>
                  {membership.role === CampaignMemberRole.MASTER
                    ? "mestre"
                    : "jogador"}
                </strong>
                .
              </div>
            ) : joinSuccess ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Bem-vindo à campanha! Aproveite a aventura com seus
                companheiros.
              </div>
            ) : (
              <button
                type="button"
                onClick={handleJoin}
                disabled={isJoining}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isJoining ? "Entrando..." : "Entrar na campanha"}
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">
            Participantes atuais
          </h2>
          {participants.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">
              Ainda não há participantes cadastrados.
            </p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              {participants.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-2"
                >
                  <span>
                    {member.user?.nickname ||
                      member.user?.email ||
                      member.userId}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-gray-500">
                    {member.role === CampaignMemberRole.MASTER
                      ? "Mestre"
                      : "Jogador"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
