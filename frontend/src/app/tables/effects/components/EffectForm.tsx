"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

import {
  createEffect,
  createEffectModifier,
  deleteEffectModifier,
  updateEffect,
  updateEffectModifier,
} from "@/lib/api";
import type {
  CreateEffectDTO,
  EffectDTO,
  EffectModifierDTO,
} from "@rpg/shared";
import {
  ComponentType,
  DamageType,
  OperationType,
  StackingPolicy,
} from "@/types/models";

import { useEffectsTables } from "../contexts/EffectsTablesContext";
import { useFormulaCatalog } from "@/hooks/useFormulaCatalog";
import { DYNAMIC_COMPONENT_PLACEHOLDER } from "@/constants/effects";

const DAMAGE_TYPE_OPTIONS = Object.values(DamageType ?? {});
const STACKING_POLICY_OPTIONS = Object.values(StackingPolicy ?? {});
const COMPONENT_TYPE_OPTIONS = Object.values(ComponentType ?? {});
const OPERATION_TYPE_OPTIONS = Object.values(OperationType ?? {});

type DamageTypeLiteral = CreateEffectDTO["damageType"];
type StackingPolicyLiteral = CreateEffectDTO["stackingPolicy"];
type ComponentTypeLiteral = (typeof ComponentType)[keyof typeof ComponentType];
type OperationTypeLiteral = (typeof OperationType)[keyof typeof OperationType];

const DEFAULT_DAMAGE_TYPE = (DAMAGE_TYPE_OPTIONS[0] ??
  "NONE") as DamageTypeLiteral;
const DEFAULT_STACKING_POLICY = (STACKING_POLICY_OPTIONS[0] ??
  "NONE") as StackingPolicyLiteral;
const DEFAULT_COMPONENT_TYPE = (COMPONENT_TYPE_OPTIONS[0] ??
  "STATUS") as ComponentTypeLiteral;
const DEFAULT_OPERATION_TYPE = (OPERATION_TYPE_OPTIONS[0] ??
  "ADD") as OperationTypeLiteral;
const PLACEHOLDER_IMAGE_URL = "https://placehold.co/128x128?text=Efeito";

type ModifierRow = {
  id?: string;
  componentName: string;
  componentType: ComponentTypeLiteral;
  operationType: OperationTypeLiteral;
  isDynamicTarget: boolean;
  cachedComponentName?: string;
  isNew?: boolean;
};

type EffectFormProps = {
  selectedEffect: EffectDTO | null;
  selectedEffectModifiers: EffectModifierDTO[];
  onEditingCompleted: (effectId: string | null) => void;
};

export function EffectForm({
  selectedEffect,
  selectedEffectModifiers,
  onEditingCompleted,
}: EffectFormProps) {
  const { mutateEffects, mutateEffectModifiers } = useEffectsTables();
  const { tokens: formulaTokens } = useFormulaCatalog();
  const modifierTargetOptions = useMemo(() => {
    const relevant = formulaTokens
      .filter(
        (token) =>
          token.category === "status" || token.category === "attribute",
      )
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

    const deduped = new Map<string, (typeof relevant)[number]>();
    relevant.forEach((token) => {
      const key = token.meta?.displayName ?? token.token;
      if (!deduped.has(key)) {
        deduped.set(key, token);
      }
    });

    return Array.from(deduped.values());
  }, [formulaTokens]);

  const [name, setName] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [description, setDescription] = useState("");
  const [removableBy, setRemovableBy] = useState("");
  const [damageType, setDamageType] =
    useState<DamageTypeLiteral>(DEFAULT_DAMAGE_TYPE);
  const [stackingPolicy, setStackingPolicy] = useState<StackingPolicyLiteral>(
    DEFAULT_STACKING_POLICY,
  );
  const [baseDuration, setBaseDuration] = useState<number>(0);
  const [modifierRows, setModifierRows] = useState<ModifierRow[]>([]);
  const [removedModifierIds, setRemovedModifierIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const isEditing = Boolean(selectedEffect);

  useEffect(() => {
    if (!selectedEffect) {
      resetForm();
      return;
    }

    setName(selectedEffect.name);
    setImgUrl(selectedEffect.imgUrl ?? "");
    setDescription(selectedEffect.description ?? "");
    setRemovableBy(selectedEffect.removableBy ?? "");
    setDamageType(selectedEffect.damageType as DamageTypeLiteral);
    setStackingPolicy(selectedEffect.stackingPolicy as StackingPolicyLiteral);
    setBaseDuration(selectedEffect.baseDuration ?? 0);
    setModifierRows(
      selectedEffectModifiers.map((modifier) => {
        const componentName = modifier.componentName ?? "";
        const isDynamic =
          componentName.trim().toUpperCase() === DYNAMIC_COMPONENT_PLACEHOLDER;
        return {
          id: modifier.id,
          componentName,
          componentType: modifier.componentType as ComponentTypeLiteral,
          operationType: modifier.operationType as OperationTypeLiteral,
          isDynamicTarget: isDynamic,
          cachedComponentName: isDynamic ? "" : componentName,
          isNew: false,
        };
      }),
    );
    setRemovedModifierIds([]);
  }, [selectedEffect, selectedEffectModifiers]);

  useEffect(() => {
    setSaveMessage(null);
    setFormError(null);
  }, [selectedEffect?.id]);

  const canAddModifier = useMemo(() => {
    return modifierRows.every((row) => {
      if (row.isDynamicTarget) return true;
      return row.componentName.trim().length > 0;
    });
  }, [modifierRows]);

  const resetForm = () => {
    setName("");
    setImgUrl("");
    setDescription("");
    setRemovableBy("");
    setDamageType(DEFAULT_DAMAGE_TYPE);
    setStackingPolicy(DEFAULT_STACKING_POLICY);
    setBaseDuration(0);
    setModifierRows([]);
    setRemovedModifierIds([]);
    setSaveMessage(null);
    setFormError(null);
  };

  const handleAddModifierRow = () => {
    setModifierRows((prev) => [
      ...prev,
      {
        componentName: "",
        componentType: DEFAULT_COMPONENT_TYPE,
        operationType: DEFAULT_OPERATION_TYPE,
        isDynamicTarget: false,
        cachedComponentName: "",
        isNew: true,
      },
    ]);
  };

  const handleRemoveModifierRow = (index: number) => {
    setModifierRows((prev) => {
      const target = prev[index];
      if (target?.id) {
        setRemovedModifierIds((ids) => [...ids, target.id!]);
      }
      return prev.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  const buildEffectPayload = (): CreateEffectDTO => ({
    name: name.trim(),
    imgUrl: imgUrl.trim() || PLACEHOLDER_IMAGE_URL,
    description: description.trim() || undefined,
    removableBy: removableBy.trim() || undefined,
    damageType,
    stackingPolicy,
    baseDuration,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      const message = "Informe o nome do efeito.";
      setFormError(message);
      toast.error(message);
      return;
    }

    const validModifierRows = modifierRows.filter(
      (row) => row.componentName.trim().length > 0,
    );

    setIsSubmitting(true);
    try {
      const effectPayload = buildEffectPayload();

      const effectResult =
        isEditing && selectedEffect
          ? await updateEffect(selectedEffect.id, effectPayload)
          : await createEffect(effectPayload);

      const modifierResults = await Promise.all(
        validModifierRows.map((row) => {
          const payload = {
            effectId: effectResult.id,
            componentName: row.componentName.trim(),
            componentType: row.componentType,
            operationType: row.operationType,
          };

          return row.id
            ? updateEffectModifier(row.id, payload)
            : createEffectModifier(payload);
        }),
      );

      if (removedModifierIds.length > 0) {
        await Promise.all(
          removedModifierIds.map((modifierId) =>
            deleteEffectModifier(modifierId),
          ),
        );
      }

      await mutateEffects(
        (previous) => {
          const list = previous ? [...previous] : [];
          const index = list.findIndex(
            (effect) => effect.id === effectResult.id,
          );
          if (index >= 0) {
            list[index] = effectResult;
            return list.sort((a, b) => a.name.localeCompare(b.name));
          }
          return [...list, effectResult].sort((a, b) =>
            a.name.localeCompare(b.name),
          );
        },
        { revalidate: false },
      );

      await mutateEffectModifiers(
        (previous) => {
          const others =
            previous?.filter(
              (modifier) => modifier.effectId !== effectResult.id,
            ) ?? [];
          return [...others, ...modifierResults];
        },
        { revalidate: false },
      );

      toast.success(
        isEditing
          ? "Efeito atualizado com sucesso!"
          : "Efeito cadastrado com sucesso!",
      );
      setSaveMessage(
        isEditing
          ? "Alterações salvas! A lista ao lado já foi atualizada."
          : "Efeito cadastrado! Ele aparece agora na lista ao lado.",
      );

      setRemovedModifierIds([]);
      onEditingCompleted(effectResult.id);
    } catch (error) {
      console.error("Falha ao salvar efeito e modificadores:", error);

      let message = "Não foi possível salvar o efeito.";
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
    <section className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <header className="mb-4 space-y-1">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEditing ? "Editar efeito" : "Cadastrar efeito"}
        </h2>
        <p className="text-sm text-gray-500">
          Defina um efeito disponível para itens, habilidades e status.
        </p>
      </header>

      <form
        className="flex-1 space-y-5 overflow-y-auto pr-2"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="effect-name"
              className="text-sm font-medium text-gray-700"
            >
              Nome
            </label>
            <input
              id="effect-name"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={name}
              disabled={isSubmitting}
              onChange={(event) => setName(event.target.value)}
              placeholder="Chama Infernal"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="effect-image"
              className="text-sm font-medium text-gray-700"
            >
              URL da imagem
            </label>
            <input
              id="effect-image"
              type="url"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={imgUrl}
              disabled={isSubmitting}
              onChange={(event) => setImgUrl(event.target.value)}
              placeholder="https://exemplo.com/imagens/efeito.png"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="effect-description"
            className="text-sm font-medium text-gray-700"
          >
            Descrição (opcional)
          </label>
          <textarea
            id="effect-description"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            rows={3}
            value={description}
            disabled={isSubmitting}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Detalhe narrativo ou impacto mecânico do efeito."
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="effect-removable"
            className="text-sm font-medium text-gray-700"
          >
            Removível por (opcional)
          </label>
          <input
            id="effect-removable"
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={removableBy}
            disabled={isSubmitting}
            onChange={(event) => setRemovableBy(event.target.value)}
            placeholder="Poção de Purificação, habilidade específica, etc."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="effect-damage-type"
              className="text-sm font-medium text-gray-700"
            >
              Tipo de dano
            </label>
            <select
              id="effect-damage-type"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={damageType}
              disabled={isSubmitting}
              onChange={(event) =>
                setDamageType(event.target.value as DamageTypeLiteral)
              }
            >
              {DAMAGE_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="effect-stacking-policy"
              className="text-sm font-medium text-gray-700"
            >
              Política de acúmulo
            </label>
            <select
              id="effect-stacking-policy"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={stackingPolicy}
              disabled={isSubmitting}
              onChange={(event) =>
                setStackingPolicy(event.target.value as StackingPolicyLiteral)
              }
            >
              {STACKING_POLICY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="effect-base-duration"
              className="text-sm font-medium text-gray-700"
            >
              Duração base (turnos)
            </label>
            <input
              id="effect-base-duration"
              type="number"
              min={0}
              step={1}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={baseDuration}
              disabled={isSubmitting}
              onChange={(event) => {
                const parsed = Number(event.target.value);
                const normalized = Number.isFinite(parsed)
                  ? Math.max(0, Math.floor(parsed))
                  : 0;
                setBaseDuration(normalized);
              }}
            />
            <p className="text-xs text-gray-500">
              Valor padrão usado ao aplicar este efeito. Use 0 para efeitos
              instantâneos.
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-indigo-200 bg-indigo-50/60 p-4">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-800">
                Modificadores do efeito
              </p>
              <p className="text-xs text-indigo-600">
                Informe os componentes afetados pelo efeito e a operação
                aplicada.
              </p>
            </div>
            <button
              type="button"
              className="rounded-md border border-indigo-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleAddModifierRow}
              disabled={!canAddModifier || isSubmitting}
            >
              Adicionar modificador
            </button>
          </header>

          {modifierRows.length === 0 ? (
            <p className="rounded-md border border-dashed border-indigo-200 bg-white px-3 py-2 text-xs text-indigo-700">
              Nenhum modificador adicionado.
            </p>
          ) : (
            <ul className="space-y-2">
              {modifierRows.map((row, index) => (
                <li
                  key={row.id ?? `new-${index}`}
                  className="rounded-lg border border-indigo-200 bg-white px-3 py-2"
                >
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <div className="space-y-1">
                      <div className="space-y-1">
                        <label className="flex items-center gap-1 text-[11px] font-medium text-indigo-700">
                          <input
                            type="checkbox"
                            className="h-3 w-3"
                            checked={row.isDynamicTarget}
                            disabled={isSubmitting}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              setModifierRows((prev) =>
                                prev.map((current, rowIndex) => {
                                  if (rowIndex !== index) return current;

                                  if (checked) {
                                    const nextCached = current.isDynamicTarget
                                      ? (current.cachedComponentName ?? "")
                                      : current.componentName;
                                    return {
                                      ...current,
                                      isDynamicTarget: true,
                                      cachedComponentName: nextCached,
                                      componentName:
                                        DYNAMIC_COMPONENT_PLACEHOLDER,
                                    };
                                  }

                                  const fallback =
                                    current.cachedComponentName ?? "";
                                  return {
                                    ...current,
                                    isDynamicTarget: false,
                                    componentName: fallback,
                                  };
                                }),
                              );
                            }}
                          />
                          Definir alvo ao vincular
                        </label>
                        <input
                          type="text"
                          list={`effect-modifier-component-${index}`}
                          className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                          placeholder="Componente (ex.: HP)"
                          value={row.componentName}
                          disabled={isSubmitting || row.isDynamicTarget}
                          onChange={(event) => {
                            const value = event.target.value;
                            setModifierRows((prev) =>
                              prev.map((current, rowIndex) =>
                                rowIndex === index
                                  ? {
                                      ...current,
                                      componentName: value,
                                      cachedComponentName: value,
                                    }
                                  : current,
                              ),
                            );
                          }}
                        />
                        <datalist id={`effect-modifier-component-${index}`}>
                          {modifierTargetOptions.map((option) => (
                            <option
                              key={option.token}
                              value={option.meta?.displayName ?? option.token}
                            >
                              {option.label}
                            </option>
                          ))}
                        </datalist>
                        {row.componentName.trim().toUpperCase() ===
                          DYNAMIC_COMPONENT_PLACEHOLDER && (
                          <p className="text-[11px] text-indigo-600">
                            Utilize este identificador para que o alvo seja
                            definido ao vincular o efeito em itens ou
                            habilidades.
                          </p>
                        )}
                      </div>
                    </div>
                    <select
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                      value={row.componentType}
                      disabled={isSubmitting}
                      onChange={(event) => {
                        const value = event.target
                          .value as ComponentTypeLiteral;
                        setModifierRows((prev) =>
                          prev.map((current, rowIndex) =>
                            rowIndex === index
                              ? { ...current, componentType: value }
                              : current,
                          ),
                        );
                      }}
                    >
                      {COMPONENT_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <select
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                      value={row.operationType}
                      disabled={isSubmitting}
                      onChange={(event) => {
                        const value = event.target
                          .value as OperationTypeLiteral;
                        setModifierRows((prev) =>
                          prev.map((current, rowIndex) =>
                            rowIndex === index
                              ? { ...current, operationType: value }
                              : current,
                          ),
                        );
                      }}
                    >
                      {OPERATION_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="self-start rounded-md border border-red-200 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      disabled={isSubmitting}
                      onClick={() => handleRemoveModifierRow(index)}
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
          <button
            type="button"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            onClick={() => {
              resetForm();
              onEditingCompleted(null);
            }}
          >
            Novo efeito
          </button>
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
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Salvando..."
              : isEditing
                ? "Atualizar efeito"
                : "Salvar efeito"}
          </button>
        </div>
      </form>

      {formError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      {saveMessage && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {saveMessage}
        </div>
      )}
    </section>
  );
}
