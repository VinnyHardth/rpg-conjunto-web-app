"use client";

/* eslint-disable @next/next/no-img-element */

import React, { use, useCallback, useEffect, useMemo, useState } from "react";
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
  updateCampaignMember,
  deleteCampaignMember,
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
  const [promotingMemberId, setPromotingMemberId] = useState<string | null>(
    null,
  );
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  useEffect(() => {
    const loadCampaign = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const campaignData = await fetchCampaignById(campaignId);
        setCampaign(campaignData);

        const [memberList, creatorData] = await Promise.all([
          fetchCampaignMembersByCampaign(campaignId),
          fetchUserById(campaignData.creatorId), // Esta chamada retorna o UserDTO
        ]);

        setMembers(memberList);
        setCreatorUser(creatorData);
      } catch (err) {
        console.error("Erro ao carregar campanha:", err);
        setError("Não foi possível carregar os dados da campanha.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaign();
  }, [campaignId]);

  const refreshMembers = useCallback(async () => {
    try {
      const updatedMembers = await fetchCampaignMembersByCampaign(campaignId);
      setMembers(updatedMembers);
      return updatedMembers;
    } catch (err) {
      console.error("Erro ao atualizar participantes da campanha:", err);
      setError("Não foi possível atualizar a lista de participantes.");
      return null;
    }
  }, [campaignId]);

  const ensureMasterMemberExists = useCallback(async () => {
    if (!campaign) return null;

    const findMaster = (
      list: CampaignMemberWithUser[] | null | undefined,
    ): CampaignMemberWithUser | null => {
      if (!list) return null;
      const match = list.find(
        (entry) =>
          entry.role === CampaignMemberRole.MASTER &&
          !entry.id.startsWith("creator-"),
      );
      return match ?? null;
    };

    const existingMaster = findMaster(members);
    if (existingMaster) {
      return existingMaster;
    }

    const refreshed = await refreshMembers();
    const masterAfterRefresh = findMaster(refreshed);
    if (masterAfterRefresh) {
      return masterAfterRefresh;
    }

    try {
      const created = await addCampaignMember({
        campaignId: campaign.id,
        userId: campaign.creatorId,
        role: CampaignMemberRole.MASTER,
        status: "ACTIVE",
      });
      const updatedMembers = (await refreshMembers()) ?? [];

      return (
        updatedMembers.find((entry) => entry.id === created.id) ??
        findMaster(updatedMembers)
      );
    } catch (err) {
      console.error("Erro ao garantir registro do mestre:", err);

      const updatedMembers = await refreshMembers();
      const master = findMaster(updatedMembers);
      if (master) {
        return master;
      }

      setError(
        "Não foi possível preparar a transferência de liderança. Tente novamente.",
      );
      return null;
    }
  }, [campaign, members, refreshMembers]);

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
    const hasMaster = list.some(
      (member) => member.role === CampaignMemberRole.MASTER,
    );

    if (hasMaster) {
      return list;
    }

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
      await refreshMembers();
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

  const handlePromoteToMaster = useCallback(
    async (member: CampaignMemberWithUser) => {
      if (!campaign) return;
      if (member.id.startsWith("creator-")) return;
      if (member.role === CampaignMemberRole.MASTER) return;

      setPromotingMemberId(member.id);
      setError(null);

      try {
        const currentMaster = await ensureMasterMemberExists();
        if (!currentMaster) {
          throw new Error("Current master not found");
        }

        if (currentMaster.id === member.id) {
          return;
        }

        const updates: Array<Promise<unknown>> = [];

        if (!currentMaster.id.startsWith("creator-")) {
          updates.push(
            updateCampaignMember(currentMaster.id, {
              role: CampaignMemberRole.PLAYER,
            }),
          );
        }

        updates.push(
          updateCampaignMember(member.id, {
            role: CampaignMemberRole.MASTER,
          }),
        );

        await Promise.all(updates);
        await refreshMembers();
      } catch (err) {
        console.error("Erro ao transferir liderança:", err);
        setError("Não foi possível transferir a liderança da campanha.");
      } finally {
        setPromotingMemberId(null);
      }
    },
    [campaign, ensureMasterMemberExists, refreshMembers, updateCampaignMember],
  );

  const handleRemoveMember = useCallback(
    async (member: CampaignMemberWithUser) => {
      if (!campaign) return;
      if (member.id.startsWith("creator-")) return;
      if (member.role === CampaignMemberRole.MASTER) return;
      if (member.userId === campaign.creatorId) return;

      setRemovingMemberId(member.id);
      setError(null);

      try {
        await deleteCampaignMember(member.id);
        await refreshMembers();
      } catch (err) {
        console.error("Erro ao remover jogador da campanha:", err);
        setError("Não foi possível remover o jogador. Tente novamente.");
      } finally {
        setRemovingMemberId(null);
      }
    },
    [campaign, deleteCampaignMember, refreshMembers],
  );

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
                  <div className="flex flex-col">
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
                  </div>
                  {(() => {
                    const isEligiblePlayer =
                      member.role === CampaignMemberRole.PLAYER &&
                      !member.id.startsWith("creator-");
                    const canPromote =
                      isMaster && isEligiblePlayer && member.userId !== user.id;
                    const canRemove =
                      isMaster &&
                      isEligiblePlayer &&
                      member.userId !== user.id &&
                      member.userId !== campaign.creatorId;

                    if (!canPromote && !canRemove) {
                      return null;
                    }

                    return (
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {canPromote && (
                          <button
                            type="button"
                            onClick={() => handlePromoteToMaster(member)}
                            disabled={
                              promotingMemberId === member.id ||
                              removingMemberId === member.id
                            }
                            className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                          >
                            {promotingMemberId === member.id
                              ? "Transferindo..."
                              : "Tornar mestre"}
                          </button>
                        )}
                        {canRemove && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member)}
                            disabled={
                              removingMemberId === member.id ||
                              promotingMemberId === member.id
                            }
                            className="rounded bg-red-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
                          >
                            {removingMemberId === member.id
                              ? "Removendo..."
                              : "Remover"}
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
