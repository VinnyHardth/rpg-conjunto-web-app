"use client";

import React, { useEffect, useMemo, useState } from "react";

import type { Campaign, CreateCampaign, CampaignMember } from "@/types/models";
import { CampaignMemberRole } from "@/types/models";
import { useCampaigns } from "@/hooks/useCampaigns";
import {
  addCampaignMember,
  fetchCampaignById,
  fetchCampaignMembersByCampaign,
  fetchUserByEmail,
} from "@/lib/api";

interface CampaignCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

type ModalStep = "form" | "invites";

interface InviteEntry extends CampaignMember {
  email?: string;
}

const DESCRIPTION_MAX_LENGTH = 2000;
const IMAGE_URL_MAX_LENGTH = 191;

const initialForm: { name: string; description: string; imageUrl: string } = {
  name: "",
  description: "",
  imageUrl: "",
};

type CampaignMemberRoleValue =
  (typeof CampaignMemberRole)[keyof typeof CampaignMemberRole];

export default function CampaignCreateModal({
  isOpen,
  onClose,
  userId,
}: CampaignCreateModalProps) {
  const { createCampaign } = useCampaigns(userId);

  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<ModalStep>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createdCampaign, setCreatedCampaign] = useState<Campaign | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<CampaignMemberRoleValue>(
    CampaignMemberRole.PLAYER,
  );
  const [isInviting, setIsInviting] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState<InviteEntry[]>([]);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    const refreshSummary = async () => {
      if (!createdCampaign) return;
      try {
        const [campaignData, membersData] = await Promise.all([
          fetchCampaignById(createdCampaign.id),
          fetchCampaignMembersByCampaign(createdCampaign.id),
        ]);
        setInvitedMembers((prev) =>
          prev.map((entry) => {
            const fresh = membersData.find((member) => member.id === entry.id);
            return fresh ?? entry;
          }),
        );
      } catch (error) {
        console.error("Erro ao atualizar resumo da campanha:", error);
      }
    };

    void refreshSummary();
  }, [createdCampaign]);

  useEffect(() => {
    if (isOpen) {
      resetModal();
    }
  }, [isOpen]);

  const resetModal = () => {
    setFormData(initialForm);
    setFormError(null);
    setCurrentStep("form");
    setIsSubmitting(false);
    setCreatedCampaign(null);
    setInviteEmail("");
    setInviteRole(CampaignMemberRole.PLAYER);
    setIsInviting(false);
    setInvitedMembers([]);
    setInviteError(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormError(null);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const trimmedForm = useMemo(() => {
    const name = formData.name.trim();
    const description = formData.description.trim();
    const imageUrl = formData.imageUrl.trim();

    return { name, description, imageUrl };
  }, [formData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) {
      setFormError("Usuário não identificado. Faça login novamente.");
      return;
    }

    const { name, description, imageUrl } = trimmedForm;

    if (!name) {
      setFormError("Informe um nome para a campanha.");
      return;
    }

    if (description.length > DESCRIPTION_MAX_LENGTH) {
      setFormError(
        `A descrição pode ter no máximo ${DESCRIPTION_MAX_LENGTH} caracteres.`,
      );
      return;
    }

    if (imageUrl.length > IMAGE_URL_MAX_LENGTH) {
      setFormError(
        `A URL da imagem pode ter no máximo ${IMAGE_URL_MAX_LENGTH} caracteres.`,
      );
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    const payload: CreateCampaign = {
      name,
      description: description || undefined,
      imageUrl: imageUrl || undefined,
      creatorId: userId,
      isFinished: false,
    };

    try {
      const campaign = await createCampaign(payload);
      setCreatedCampaign(campaign);
      setCurrentStep("invites");
    } catch (error) {
      console.error("Erro ao criar campanha:", error);
      setFormError(
        "Não foi possível criar a campanha. Verifique os dados e tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inviteLink = useMemo(() => {
    if (!createdCampaign && typeof window === "undefined") return "";
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:4000";
    return createdCampaign
      ? `${base}/campaigns/${createdCampaign.id}/join`
      : "";
  }, [createdCampaign]);

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!createdCampaign) return;

    const email = inviteEmail.trim();
    if (!email) {
      setInviteError("Informe o e-mail do usuário que deseja convidar.");
      return;
    }

    setInviteError(null);
    setIsInviting(true);
    try {
      const user = await fetchUserByEmail(email);
      const member = await addCampaignMember({
        campaignId: createdCampaign.id,
        userId: user.id,
        role: inviteRole,
        status: "INVITED",
      });

      setInvitedMembers((prev) => [...prev, { ...member, email }]);
      setInviteEmail("");

      const membersData = await fetchCampaignMembersByCampaign(
        createdCampaign.id,
      );
      setInvitedMembers((prev) =>
        membersData.map((entry) => ({
          ...entry,
          email: prev.find((p) => p.id === entry.id)?.email,
        })),
      );
    } catch (error) {
      console.error("Erro ao convidar usuário:", error);
      setInviteError(
        "Não foi possível enviar o convite. Verifique o e-mail informado.",
      );
    } finally {
      setIsInviting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      alert("Link copiado para a área de transferência!");
    } catch (error) {
      console.error("Erro ao copiar link:", error);
      alert("Não foi possível copiar o link. Copie manualmente.");
    }
  };

  const invitedCount = invitedMembers.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-2xl text-gray-400 transition hover:text-red-500"
          aria-label="Fechar modal de campanha"
        >
          ✖
        </button>

        {currentStep === "form" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <header>
              <h2 className="text-2xl font-bold text-gray-800">
                Criar nova campanha
              </h2>
              <p className="text-sm text-gray-500">
                Defina as informações principais para iniciar a sua aventura.
              </p>
            </header>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="campaign-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nome da campanha
                </label>
                <input
                  id="campaign-name"
                  name="name"
                  type="text"
                  maxLength={191}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Ex.: Crônicas de Eldoria"
                  value={formData.name}
                  onChange={(event) =>
                    handleInputChange("name", event.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="campaign-description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Descrição
                </label>
                <textarea
                  id="campaign-description"
                  name="description"
                  rows={4}
                  maxLength={DESCRIPTION_MAX_LENGTH}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Conte um pouco sobre a missão, ambientação ou objetivos."
                  value={formData.description}
                  onChange={(event) =>
                    handleInputChange("description", event.target.value)
                  }
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length}/{DESCRIPTION_MAX_LENGTH}{" "}
                  caracteres
                </p>
              </div>

              <div>
                <label
                  htmlFor="campaign-image"
                  className="block text-sm font-medium text-gray-700"
                >
                  URL da imagem (opcional)
                </label>
                <input
                  id="campaign-image"
                  name="imageUrl"
                  type="url"
                  maxLength={IMAGE_URL_MAX_LENGTH}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(event) =>
                    handleInputChange("imageUrl", event.target.value)
                  }
                  title="Informe uma URL válida (https://...)"
                />
              </div>
            </div>

            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Criando..." : "Criar campanha"}
              </button>
            </div>
          </form>
        )}

        {currentStep === "invites" && createdCampaign && (
          <div className="space-y-6">
            <header className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-800">
                Convide sua equipe
              </h2>
              <p className="text-sm text-gray-500">
                Compartilhe o link ou envie convites diretos para que outros
                jogadores participem.
              </p>
            </header>

            <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Link permanente
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Use este link para convidar novos membros para a campanha.
              </p>
              <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Copiar link
                </button>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Enviar convite por e-mail
              </h3>
              <form onSubmit={handleInvite} className="mt-3 space-y-3">
                <div className="flex flex-col gap-3 md:flex-row">
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                  <select
                    value={inviteRole}
                    onChange={(event) =>
                      setInviteRole(
                        event.target.value as CampaignMemberRoleValue,
                      )
                    }
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {Object.values(CampaignMemberRole).map((role) => (
                      <option key={role} value={role}>
                        {role === CampaignMemberRole.MASTER
                          ? "Mestre"
                          : "Jogador"}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                    disabled={isInviting}
                  >
                    {isInviting ? "Enviando..." : "Enviar convite"}
                  </button>
                </div>
                {inviteError && (
                  <p className="text-sm text-red-500">{inviteError}</p>
                )}
              </form>

              {invitedCount > 0 && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">
                  Convites enviados: {invitedCount}
                </div>
              )}

              {invitedMembers.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {invitedMembers.map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                    >
                      <span>
                        {member.email ?? member.userId} —{" "}
                        <strong>
                          {member.role === CampaignMemberRole.MASTER
                            ? "Mestre"
                            : "Jogador"}
                        </strong>
                      </span>
                      <span className="text-xs text-gray-500">
                        Convite enviado
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Concluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
