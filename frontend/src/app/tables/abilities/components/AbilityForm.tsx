"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

import {
  createAbility,
  createAbilityEffect,
  deleteAbilityEffect,
  updateAbility,
  updateAbilityEffect,
} from "@/lib/api";
import type {
  AbilitiesDTO,
  AbilityEffectDTO,
  CreateAbilitiesDTO,
} from "@rpg/shared";
import { CostType } from "@/types/models";

import { useAbilitiesTables } from "../contexts/AbilitiesTablesContext";

type CostTypeLiteral = (typeof CostType)[keyof typeof CostType];

const COST_TYPE_OPTIONS = Object.values(CostType ?? {});
const DEFAULT_COST_TYPE = (COST_TYPE_OPTIONS[0] ?? "NONE") as CostTypeLiteral;
const PLACEHOLDER_IMAGE_URL = "https://placehold.co/128x128?text=Habilidade";

type AbilityEffectRow = {
  id?: string;
  effectId: string;
  formula: string;
};

type AbilityFormProps = {
  selectedAbility: AbilitiesDTO | null;
  selectedAbilityEffects: AbilityEffectDTO[];
  onEditingCompleted: (abilityId: string | null) => void;
};

export function AbilityForm({
  selectedAbility,
  selectedAbilityEffects,
  onEditingCompleted,
}: AbilityFormProps) {
  const { mutateAbilities, mutateAbilityEffects, effects, loadingEffects } =
    useAbilitiesTables();

  const effectOptions = useMemo(
    () =>
      (effects ?? [])
        .filter((effect) => effect.deletedAt == null)
        .map((effect) => ({ id: effect.id, name: effect.name })),
    [effects],
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [costType, setCostType] = useState<CostTypeLiteral>(DEFAULT_COST_TYPE);
  const [mpCost, setMpCost] = useState<number>(0);
  const [tpCost, setTpCost] = useState<number>(0);
  const [hpCost, setHpCost] = useState<number>(0);
  const [cooldown, setCooldown] = useState<number>(0);
  const [effectRows, setEffectRows] = useState<AbilityEffectRow[]>([]);
  const [removedEffectIds, setRemovedEffectIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const isEditing = Boolean(selectedAbility);

  useEffect(() => {
    if (!selectedAbility) {
      resetForm();
      return;
    }

    setName(selectedAbility.name);
    setDescription(selectedAbility.description ?? "");
    setImageURL(selectedAbility.imageURL ?? "");
    setCostType(selectedAbility.cost_type as CostTypeLiteral);
    setMpCost(selectedAbility.mp_cost ?? 0);
    setTpCost(selectedAbility.tp_cost ?? 0);
    setHpCost(selectedAbility.hp_cost ?? 0);
    setCooldown(selectedAbility.cooldown_value ?? 0);
    setEffectRows(
      selectedAbilityEffects.map((abilityEffect) => ({
        id: abilityEffect.id,
        effectId: abilityEffect.effectId,
        formula: abilityEffect.formula ?? "",
      })),
    );
    setRemovedEffectIds([]);
  }, [selectedAbility, selectedAbilityEffects]);

  useEffect(() => {
    setFormError(null);
    setSaveMessage(null);
  }, [selectedAbility?.id]);

  const canAddEffectRow = useMemo(() => {
    if (effectOptions.length === 0) return false;
    return effectRows.every((row) => row.effectId);
  }, [effectOptions.length, effectRows]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setImageURL("");
    setCostType(DEFAULT_COST_TYPE);
    setMpCost(0);
    setTpCost(0);
    setHpCost(0);
    setCooldown(0);
    setEffectRows([]);
    setRemovedEffectIds([]);
    setFormError(null);
    setSaveMessage(null);
  };

  const assignEffectToRow = (index: number, effectId: string) => {
    setEffectRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              effectId,
            }
          : row,
      ),
    );
  };

  const handleAddEffectRow = () => {
    const availableEffect =
      effectOptions.find(
        (option) => !effectRows.some((row) => row.effectId === option.id),
      ) ?? effectOptions[0];

    setEffectRows((prev) => [
      ...prev,
      {
        effectId: availableEffect?.id ?? "",
        formula: "",
      },
    ]);
  };

  const handleRemoveEffectRow = (index: number) => {
    setEffectRows((prev) => {
      const target = prev[index];
      if (target?.id) {
        setRemovedEffectIds((prevIds) => [...prevIds, target.id!]);
      }
      return prev.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  const buildAbilityPayload = (): CreateAbilitiesDTO => ({
    name: name.trim(),
    description: description.trim(),
    imageURL: imageURL.trim() || PLACEHOLDER_IMAGE_URL,
    cost_type: costType,
    mp_cost: Number.isFinite(mpCost) && mpCost >= 0 ? mpCost : 0,
    tp_cost: Number.isFinite(tpCost) && tpCost >= 0 ? tpCost : 0,
    hp_cost: Number.isFinite(hpCost) && hpCost >= 0 ? hpCost : 0,
    cooldown_value: Number.isFinite(cooldown) && cooldown >= 0 ? cooldown : 0,
  });

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setFormError("Informe o nome da habilidade.");
      toast.error("Informe o nome da habilidade.");
      return false;
    }

    if (!description.trim()) {
      setFormError("Informe a descrição da habilidade.");
      toast.error("Informe a descrição da habilidade.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    const validRows = effectRows.filter((row) => row.effectId);

    setIsSubmitting(true);
    try {
      const abilityPayload = buildAbilityPayload();

      const abilityResult =
        isEditing && selectedAbility
          ? await updateAbility(selectedAbility.id, abilityPayload)
          : await createAbility(abilityPayload);

      const effectResults = await Promise.all(
        validRows.map((row) => {
          const payload = {
            abilityId: abilityResult.id,
            effectId: row.effectId,
            formula: row.formula.trim() || null,
          };

          return row.id
            ? updateAbilityEffect(row.id, payload)
            : createAbilityEffect(payload);
        }),
      );

      if (removedEffectIds.length > 0) {
        await Promise.all(
          removedEffectIds.map((id) => deleteAbilityEffect(id)),
        );
      }

      await mutateAbilities(
        (prev) => {
          const list = prev ? [...prev] : [];
          const index = list.findIndex((item) => item.id === abilityResult.id);
          if (index >= 0) {
            list[index] = abilityResult;
            return list.sort((a, b) => a.name.localeCompare(b.name));
          }
          return [...list, abilityResult].sort((a, b) =>
            a.name.localeCompare(b.name),
          );
        },
        { revalidate: false },
      );

      await mutateAbilityEffects(
        (prev) => {
          const others =
            prev?.filter((item) => item.abilityId !== abilityResult.id) ?? [];
          return [...others, ...effectResults];
        },
        { revalidate: false },
      );

      toast.success(
        isEditing
          ? "Habilidade atualizada com sucesso!"
          : "Habilidade cadastrada com sucesso!",
      );
      setSaveMessage(
        isEditing
          ? "Alterações salvas! A lista ao lado já foi atualizada."
          : "Habilidade cadastrada! Ela aparece agora na lista ao lado.",
      );

      setRemovedEffectIds([]);
      onEditingCompleted(abilityResult.id);
    } catch (error) {
      console.error("Falha ao salvar habilidade:", error);

      let message = "Não foi possível salvar a habilidade.";
      if (isAxiosError(error)) {
        const backendMessage =
          (error.response?.data as { message?: string; error?: string })
            ?.message ??
          (error.response?.data as { message?: string; error?: string })?.error;
        if (backendMessage) {
          message = backendMessage;
        }
      }

      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onEditingCompleted(null);
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <header className="mb-4 space-y-1">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEditing ? "Editar habilidade" : "Cadastrar habilidade"}
        </h2>
        <p className="text-sm text-gray-500">
          Defina habilidades para vincular a personagens e efeitos.
        </p>
      </header>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="ability-name"
              className="text-sm font-medium text-gray-700"
            >
              Nome
            </label>
            <input
              id="ability-name"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={name}
              disabled={isSubmitting}
              onChange={(event) => setName(event.target.value)}
              placeholder="Golpe Flamejante"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="ability-image"
              className="text-sm font-medium text-gray-700"
            >
              URL da imagem
            </label>
            <input
              id="ability-image"
              type="url"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={imageURL}
              disabled={isSubmitting}
              onChange={(event) => setImageURL(event.target.value)}
              placeholder="https://exemplo.com/imagens/habilidade.png"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="ability-description"
            className="text-sm font-medium text-gray-700"
          >
            Descrição
          </label>
          <textarea
            id="ability-description"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            rows={3}
            value={description}
            disabled={isSubmitting}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descreva o efeito narrativo ou mecânico da habilidade."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="ability-cost-type"
              className="text-sm font-medium text-gray-700"
            >
              Tipo de custo
            </label>
            <select
              id="ability-cost-type"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={costType}
              disabled={isSubmitting}
              onChange={(event) =>
                setCostType(event.target.value as CostTypeLiteral)
              }
            >
              {COST_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="ability-cooldown"
              className="text-sm font-medium text-gray-700"
            >
              Recarga (turnos)
            </label>
            <input
              id="ability-cooldown"
              type="number"
              min={0}
              step={1}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={cooldown}
              disabled={isSubmitting}
              onChange={(event) => setCooldown(Number(event.target.value))}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label
              htmlFor="ability-mp"
              className="text-sm font-medium text-gray-700"
            >
              Custo de MP
            </label>
            <input
              id="ability-mp"
              type="number"
              min={0}
              step={1}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={mpCost}
              disabled={isSubmitting}
              onChange={(event) => setMpCost(Number(event.target.value))}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="ability-tp"
              className="text-sm font-medium text-gray-700"
            >
              Custo de TP
            </label>
            <input
              id="ability-tp"
              type="number"
              min={0}
              step={1}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={tpCost}
              disabled={isSubmitting}
              onChange={(event) => setTpCost(Number(event.target.value))}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="ability-hp"
              className="text-sm font-medium text-gray-700"
            >
              Custo de HP
            </label>
            <input
              id="ability-hp"
              type="number"
              min={0}
              step={1}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={hpCost}
              disabled={isSubmitting}
              onChange={(event) => setHpCost(Number(event.target.value))}
            />
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-purple-200 bg-purple-50/60 p-4">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-800">
                Efeitos vinculados
              </p>
              <p className="text-xs text-purple-600">
                Associe efeitos já cadastrados e informe uma fórmula opcional.
              </p>
            </div>
            <button
              type="button"
              className="rounded-md border border-purple-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleAddEffectRow}
              disabled={!canAddEffectRow || isSubmitting || loadingEffects}
            >
              Adicionar efeito
            </button>
          </header>

          {loadingEffects ? (
            <p className="rounded-md border border-dashed border-purple-200 bg-white px-3 py-2 text-xs text-purple-700">
              Carregando efeitos disponíveis...
            </p>
          ) : effectOptions.length === 0 ? (
            <p className="rounded-md border border-dashed border-purple-200 bg-white px-3 py-2 text-xs text-purple-700">
              Cadastre efeitos primeiro para vinculá-los às habilidades.
            </p>
          ) : effectRows.length === 0 ? (
            <p className="rounded-md border border-dashed border-purple-200 bg-white px-3 py-2 text-xs text-purple-700">
              Nenhum efeito associado.
            </p>
          ) : (
            <ul className="space-y-2">
              {effectRows.map((row, index) => (
                <li
                  key={row.id ?? `new-${index}`}
                  className="rounded-lg border border-purple-200 bg-white px-3 py-2"
                >
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <select
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-purple-500 focus:outline-none"
                      value={row.effectId}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        assignEffectToRow(index, event.target.value)
                      }
                    >
                      {effectOptions.map((effect) => (
                        <option key={effect.id} value={effect.id}>
                          {effect.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Fórmula (opcional)"
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-purple-500 focus:outline-none"
                      value={row.formula}
                      disabled={isSubmitting}
                      onChange={(event) => {
                        const value = event.target.value;
                        setEffectRows((prev) =>
                          prev.map((current, rowIndex) =>
                            rowIndex === index
                              ? { ...current, formula: value }
                              : current,
                          ),
                        );
                      }}
                    />
                    <button
                      type="button"
                      className="self-start rounded-md border border-red-200 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      disabled={isSubmitting}
                      onClick={() => handleRemoveEffectRow(index)}
                    >
                      Remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {isEditing && (
            <button
              type="button"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              onClick={handleCancel}
            >
              Cancelar edição
            </button>
          )}
          {!isEditing && (
            <button
              type="button"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              onClick={resetForm}
            >
              Limpar
            </button>
          )}
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Salvando..."
              : isEditing
                ? "Atualizar habilidade"
                : "Salvar habilidade"}
          </button>
        </div>
      </form>

      {formError && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      {saveMessage && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {saveMessage}
        </div>
      )}
    </section>
  );
}
