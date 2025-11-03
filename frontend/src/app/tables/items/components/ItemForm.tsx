"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";

import {
  createItem,
  createItemEffect,
  createItemSkill,
  deleteItemEffect,
  updateItem,
  updateItemEffect,
} from "@/lib/api";
import { FormulaInput } from "@/components/formula/FormulaInput";
import { ItemType } from "@/types/models";
import type {
  EffectModifierDTO,
  ItemType as ItemTypeLiteral,
  ItemsDTO,
  ComponentType as ComponentTypeLiteral,
} from "@rpg/shared";

import { useFormulaCatalog } from "@/hooks/useFormulaCatalog";
import {
  parseEffectLinkFormula,
  buildEffectLinkFormula,
} from "@/utils/effectFormula";
import { useItemsTables } from "../contexts/ItemsTablesContext";
import { fetchEffectModifiers } from "@/lib/api";
import { ComponentType } from "@/types/models";
import { DYNAMIC_COMPONENT_PLACEHOLDER } from "@/constants/effects";

type EffectRow = {
  id?: string;
  effectId: string;
  formula: string;
  target: string;
};

type SkillRow = {
  abilityId: string;
  cooldown: number;
};

const ITEM_TYPE_OPTIONS = Object.values(ItemType ?? {});
const DEFAULT_ITEM_TYPE = (ITEM_TYPE_OPTIONS[0] ??
  "EQUIPPABLE") as ItemTypeLiteral;

type ItemFormProps = {
  selectedItem: ItemsDTO | null;
  onEditingCompleted: (itemId: string | null) => void;
};

export function ItemForm({ selectedItem, onEditingCompleted }: ItemFormProps) {
  const {
    effects,
    effectsError,
    loadingEffects,
    mutateItems,
    itemEffects,
    itemEffectsError,
    loadingItemEffects,
    mutateItemEffects,
  } = useItemsTables();

  const {
    tokens: formulaTokens,
    loading: loadingFormulaCatalog,
    error: formulaCatalogError,
  } = useFormulaCatalog();

  const { data: effectModifiers } = useSWR<EffectModifierDTO[]>(
    "effect-modifiers",
    fetchEffectModifiers,
    {
      revalidateOnFocus: false,
    },
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [itemType, setItemType] = useState<ItemTypeLiteral>(DEFAULT_ITEM_TYPE);
  const [value, setValue] = useState<number>(0);
  const [effectRows, setEffectRows] = useState<EffectRow[]>([]);
  const [skillRows, setSkillRows] = useState<SkillRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(selectedItem);

  const isEquippable = itemType === ItemType.EQUIPPABLE;
  const isConsumable = itemType === ItemType.CONSUMABLE;

  const availableEffects = useMemo(
    () => (effects ?? []).filter((effect) => effect.deletedAt == null),
    [effects],
  );

  const statusTargetTokens = useMemo(
    () =>
      formulaTokens
        .filter((token) => token.meta?.kind === "STATUS")
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
    [formulaTokens],
  );

  const attributeTargetTokens = useMemo(
    () =>
      formulaTokens
        .filter((token) => token.meta?.kind === "ATTRIBUTE")
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
    [formulaTokens],
  );

  const combinedTargetTokens = useMemo(
    () => [...statusTargetTokens, ...attributeTargetTokens],
    [statusTargetTokens, attributeTargetTokens],
  );

  const effectDynamicTargetMap = useMemo(() => {
    const map = new Map<string, ComponentTypeLiteral>();
    (effectModifiers ?? []).forEach((modifier) => {
      if (
        modifier.componentName?.trim().toUpperCase() ===
        DYNAMIC_COMPONENT_PLACEHOLDER
      ) {
        map.set(
          modifier.effectId,
          modifier.componentType as ComponentTypeLiteral,
        );
      }
    });
    return map;
  }, [effectModifiers]);

  const canAddEffect = useMemo(() => {
    if (availableEffects.length === 0) return false;
    return availableEffects.some(
      (effect) => !effectRows.some((row) => row.effectId === effect.id),
    );
  }, [availableEffects, effectRows]);

  const isLoadingEffectData =
    loadingEffects || (isEditing && loadingItemEffects);
  const hasEffectOptionsError = Boolean(effectsError);
  const hasItemEffectsError = Boolean(isEditing && itemEffectsError);

  const resetForm = () => {
    setName("");
    setDescription("");
    setImageURL("");
    setItemType(DEFAULT_ITEM_TYPE);
    setValue(0);
    setEffectRows([]);
    setSkillRows([]);
  };

  useEffect(() => {
    if (!selectedItem) {
      resetForm();
      return;
    }

    setName(selectedItem.name ?? "");
    setDescription(selectedItem.description ?? "");
    setImageURL(selectedItem.imageURL ?? "");
    setItemType(selectedItem.itemType as ItemTypeLiteral);
    setValue(selectedItem.value ?? 0);

    const relatedEffects = (itemEffects ?? [])
      .filter(
        (effect) =>
          effect.itemId === selectedItem.id && effect.deletedAt == null,
      )
      .map((effect) => {
        const parsed = parseEffectLinkFormula(effect.formula ?? "");
        return {
          id: effect.id,
          effectId: effect.effectsId,
          formula: parsed.expr,
          target: parsed.target,
        };
      });

    setEffectRows(relatedEffects);
    setSkillRows([]);
  }, [itemEffects, selectedItem]);

  useEffect(() => {
    if (!formulaCatalogError) return;
    console.warn(
      "Falha ao carregar variáveis de fórmula:",
      formulaCatalogError,
    );
  }, [formulaCatalogError]);

  const handleCancelEditing = () => {
    resetForm();
    onEditingCompleted(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Informe o nome do item.");
      return;
    }

    if (!Number.isFinite(value) || value < 0) {
      toast.error("Informe um valor válido.");
      return;
    }

    const sanitizedEffects = (effectRows ?? [])
      .filter((row) => row.effectId)
      .map((row) => {
        const formulaValue = buildEffectLinkFormula(row.formula, row.target);
        return {
          id: row.id,
          effectId: row.effectId,
          formula: formulaValue.trim(),
        };
      });

    const sanitizedSkills = (skillRows ?? [])
      .filter((row) => row.abilityId.trim())
      .map((row) => ({
        abilityId: row.abilityId.trim(),
        cooldown:
          Number.isFinite(row.cooldown) && row.cooldown >= 0 ? row.cooldown : 0,
      }));

    setIsSubmitting(true);
    let shouldRefreshItemEffects = false;
    try {
      if (isEditing && selectedItem) {
        const itemId = selectedItem.id;
        const updatedItem = await updateItem(itemId, {
          name: name.trim(),
          description: description.trim() || undefined,
          imageURL: imageURL.trim() || undefined,
          itemType,
          value,
        });

        await mutateItems(
          (prev) =>
            prev?.map((item) =>
              item.id === updatedItem.id ? updatedItem : item,
            ) ?? [updatedItem],
          { revalidate: false },
        );

        if (isEquippable || isConsumable) {
          const relatedEffects = (itemEffects ?? []).filter(
            (effect) => effect.itemId === itemId && effect.deletedAt == null,
          );

          const toCreate = sanitizedEffects.filter((effect) => !effect.id);

          const toUpdate = sanitizedEffects
            .filter((effect) => effect.id)
            .filter((effect) => {
              const current = relatedEffects.find(
                (itemEffect) => itemEffect.id === effect.id,
              );
              if (!current) return true;
              return (
                current.effectsId !== effect.effectId ||
                (current.formula ?? "") !== effect.formula
              );
            });

          const retainedIds = new Set(
            sanitizedEffects
              .filter((effect) => effect.id)
              .map((effect) => effect.id as string),
          );

          const toDelete = relatedEffects.filter(
            (effect) => !retainedIds.has(effect.id),
          );

          if (toCreate.length || toUpdate.length || toDelete.length) {
            shouldRefreshItemEffects = true;

            await Promise.all([
              ...toCreate.map((effect) =>
                createItemEffect({
                  itemId,
                  effectsId: effect.effectId,
                  formula: effect.formula,
                }),
              ),
              ...toUpdate.map((effect) =>
                updateItemEffect(effect.id as string, {
                  itemId,
                  effectsId: effect.effectId,
                  formula: effect.formula,
                }),
              ),
              ...toDelete.map((effect) => deleteItemEffect(effect.id)),
            ]);
          }
        } else if (
          (itemEffects ?? []).some(
            (effect) => effect.itemId === itemId && effect.deletedAt == null,
          )
        ) {
          const relatedEffects = (itemEffects ?? []).filter(
            (effect) => effect.itemId === itemId && effect.deletedAt == null,
          );

          if (relatedEffects.length) {
            shouldRefreshItemEffects = true;
            await Promise.all(
              relatedEffects.map((effect) => deleteItemEffect(effect.id)),
            );
          }
        }

        toast.success("Item atualizado com sucesso!");
        onEditingCompleted(itemId);
      } else {
        const createdItem = await createItem({
          name: name.trim(),
          description: description.trim() || undefined,
          imageURL: imageURL.trim() || undefined,
          itemType,
          value,
        });

        if ((isEquippable || isConsumable) && sanitizedEffects.length > 0) {
          await Promise.all(
            sanitizedEffects.map((effect) =>
              createItemEffect({
                itemId: createdItem.id,
                effectsId: effect.effectId,
                formula: effect.formula,
              }),
            ),
          );
          shouldRefreshItemEffects = true;
        }

        if (isEquippable && sanitizedSkills.length > 0) {
          await Promise.all(
            sanitizedSkills.map((skill) =>
              createItemSkill({
                itemId: createdItem.id,
                abilityId: skill.abilityId,
                cooldown: skill.cooldown,
              }),
            ),
          );
        }

        await mutateItems(
          (prev) => (prev ? [...prev, createdItem] : [createdItem]),
          { revalidate: false },
        );

        toast.success("Item cadastrado com sucesso!");
        resetForm();
        onEditingCompleted(null);
      }

      if (shouldRefreshItemEffects) {
        await mutateItemEffects();
      }
    } catch (error) {
      console.error(
        isEditing ? "Falha ao atualizar item:" : "Falha ao cadastrar item:",
        error,
      );
      toast.error(
        isEditing
          ? "Não foi possível atualizar o item."
          : "Não foi possível cadastrar o item.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <header className="mb-4 space-y-1">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEditing ? "Editar item" : "Informações do item"}
        </h2>
        <p className="text-sm text-gray-500">
          {isEditing
            ? "Atualize os dados principais do item selecionado."
            : "Defina os dados principais e os efeitos opcionais do novo item."}
        </p>
      </header>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="item-name"
              className="text-sm font-medium text-gray-700"
            >
              Nome
            </label>
            <input
              id="item-name"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={name}
              disabled={isSubmitting}
              onChange={(event) => setName(event.target.value)}
              placeholder="Espada Longa"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="item-value"
              className="text-sm font-medium text-gray-700"
            >
              Valor base
            </label>
            <input
              id="item-value"
              type="number"
              min={0}
              step={1}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={value}
              disabled={isSubmitting}
              onChange={(event) => setValue(Number(event.target.value))}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="item-type"
            className="text-sm font-medium text-gray-700"
          >
            Tipo
          </label>
          <select
            id="item-type"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={itemType}
            disabled={isSubmitting}
            onChange={(event) =>
              setItemType(event.target.value as ItemTypeLiteral)
            }
          >
            {ITEM_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="item-description"
            className="text-sm font-medium text-gray-700"
          >
            Descrição
          </label>
          <textarea
            id="item-description"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            rows={3}
            value={description}
            disabled={isSubmitting}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Detalhes narrativos ou mecânicos do item."
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="item-image"
            className="text-sm font-medium text-gray-700"
          >
            URL da imagem (opcional)
          </label>
          <input
            id="item-image"
            type="url"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={imageURL}
            disabled={isSubmitting}
            onChange={(event) => setImageURL(event.target.value)}
            placeholder="https://exemplo.com/imagens/espada-longa.png"
          />
        </div>

        {(isEquippable || isConsumable) && (
          <div className="space-y-3 rounded-lg border border-indigo-200 bg-indigo-50/60 p-4">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-indigo-800">
                  {isEquippable
                    ? "Efeitos enquanto equipado"
                    : "Efeitos ao consumir"}
                </p>
                <p className="text-xs text-indigo-600">
                  Vincule efeitos já cadastrados para aplicar as fórmulas
                  automaticamente.
                </p>
              </div>
              <button
                type="button"
                className="rounded-md border border-indigo-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() =>
                  setEffectRows((prev) => [
                    ...prev,
                    { effectId: "", formula: "", target: "" },
                  ])
                }
                disabled={!canAddEffect || isSubmitting || isLoadingEffectData}
              >
                Adicionar efeito
              </button>
            </header>

            {hasEffectOptionsError ? (
              <p className="rounded-md border border-dashed border-red-200 bg-white px-3 py-2 text-xs text-red-600">
                Não foi possível carregar a lista de efeitos disponíveis.
              </p>
            ) : hasItemEffectsError ? (
              <p className="rounded-md border border-dashed border-red-200 bg-white px-3 py-2 text-xs text-red-600">
                Não foi possível carregar os efeitos vinculados a este item.
              </p>
            ) : isLoadingEffectData ? (
              <p className="text-xs text-indigo-700">Carregando efeitos...</p>
            ) : availableEffects.length === 0 ? (
              <p className="rounded-md border border-dashed border-indigo-200 bg-white px-3 py-2 text-xs text-indigo-700">
                Cadastre efeitos no sistema para vinculá-los aos itens.
              </p>
            ) : effectRows.length === 0 ? (
              <p className="rounded-md border border-dashed border-indigo-200 bg-white px-3 py-2 text-xs text-indigo-700">
                Nenhum efeito adicionado.
              </p>
            ) : (
              <ul className="space-y-2">
                {effectRows.map((row, index) => {
                  const needsTarget = effectDynamicTargetMap.has(row.effectId);
                  const expectedType = effectDynamicTargetMap.get(row.effectId);
                  const availableTargets = needsTarget
                    ? expectedType === ComponentType.STATUS
                      ? statusTargetTokens
                      : expectedType === ComponentType.ATTRIBUTE
                        ? attributeTargetTokens
                        : combinedTargetTokens
                    : [];
                  const gridTemplate = needsTarget
                    ? "sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                    : "sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]";

                  return (
                    <li
                      key={index}
                      className="rounded-lg border border-indigo-200 bg-white px-3 py-2"
                    >
                      <div className={`grid gap-2 ${gridTemplate}`}>
                        <select
                          className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                          value={row.effectId}
                          disabled={isSubmitting || isLoadingEffectData}
                          onChange={(event) => {
                            const next = [...effectRows];
                            next[index] = {
                              ...row,
                              effectId: event.target.value,
                              target: "",
                            };
                            setEffectRows(next);
                          }}
                        >
                          <option value="">Selecione um efeito</option>
                          {availableEffects.map((effect) => (
                            <option key={effect.id} value={effect.id}>
                              {effect.name}
                            </option>
                          ))}
                          {row.effectId &&
                            !availableEffects.some(
                              (effect) => effect.id === row.effectId,
                            ) && (
                              <option value={row.effectId}>
                                {row.effectId} (removido)
                              </option>
                            )}
                        </select>
                        {needsTarget && (
                          <div>
                            <input
                              type="text"
                              list={`item-effect-target-${index}`}
                              className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                              placeholder="Selecione o alvo"
                              value={row.target}
                              disabled={isSubmitting || isLoadingEffectData}
                              onChange={(event) => {
                                const next = [...effectRows];
                                next[index] = {
                                  ...row,
                                  target: event.target.value,
                                };
                                setEffectRows(next);
                              }}
                            />
                            <datalist id={`item-effect-target-${index}`}>
                              {availableTargets.map((option) => (
                                <option key={option.token} value={option.token}>
                                  {option.label}
                                </option>
                              ))}
                              {row.target &&
                                !availableTargets.some(
                                  (option) => option.token === row.target,
                                ) && (
                                  <option value={row.target}>
                                    {row.target}
                                  </option>
                                )}
                            </datalist>
                          </div>
                        )}
                        <FormulaInput
                          value={row.formula}
                          onChange={(nextValue) => {
                            const next = [...effectRows];
                            next[index] = { ...row, formula: nextValue };
                            setEffectRows(next);
                          }}
                          tokens={formulaTokens}
                          disabled={isSubmitting || isLoadingEffectData}
                          placeholder="Fórmula (opcional)"
                          inputClassName="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                          containerClassName="space-y-1"
                          loading={loadingFormulaCatalog}
                          error={formulaCatalogError}
                          helperLabel="Variáveis"
                          helperTitle="Variáveis para fórmulas"
                          helperDescription="Use as variáveis cadastradas para combinar atributos e status nas fórmulas."
                        />
                        <button
                          type="button"
                          className="self-start rounded-md border border-red-200 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                          disabled={isSubmitting || isLoadingEffectData}
                          onClick={() =>
                            setEffectRows((prev) =>
                              prev.filter((_, rowIndex) => rowIndex !== index),
                            )
                          }
                        >
                          Remover
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {isEquippable && (
          <div className="space-y-3 rounded-lg border border-purple-200 bg-purple-50/60 p-4">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-800">
                  Habilidades concedidas
                </p>
                <p className="text-xs text-purple-600">
                  Informe a habilidade disponível e o tempo de recarga em
                  turnos.
                </p>
              </div>
              <button
                type="button"
                className="rounded-md border border-purple-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700 transition hover:bg-purple-100 disabled:opacity-50"
                disabled={isSubmitting || isEditing}
                onClick={() =>
                  setSkillRows((prev) => [
                    ...prev,
                    { abilityId: "", cooldown: 0 },
                  ])
                }
              >
                Adicionar habilidade
              </button>
            </header>

            {isEditing ? (
              <p className="rounded-md border border-dashed border-purple-200 bg-white px-3 py-2 text-xs text-purple-700">
                Habilidades concedidas devem ser gerenciadas separadamente.
              </p>
            ) : skillRows.length === 0 ? (
              <p className="rounded-md border border-dashed border-purple-200 bg-white px-3 py-2 text-xs text-purple-700">
                Nenhuma habilidade adicionada.
              </p>
            ) : (
              <ul className="space-y-2">
                {skillRows.map((row, index) => (
                  <li
                    key={index}
                    className="rounded-lg border border-purple-200 bg-white px-3 py-2"
                  >
                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px_auto]">
                      <input
                        type="text"
                        className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-purple-500 focus:outline-none"
                        placeholder="ID da habilidade"
                        value={row.abilityId}
                        disabled={isSubmitting}
                        onChange={(event) => {
                          const next = [...skillRows];
                          next[index] = {
                            ...row,
                            abilityId: event.target.value,
                          };
                          setSkillRows(next);
                        }}
                      />
                      <input
                        type="number"
                        min={0}
                        step={1}
                        className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-purple-500 focus:outline-none"
                        value={row.cooldown}
                        disabled={isSubmitting}
                        onChange={(event) => {
                          const next = [...skillRows];
                          next[index] = {
                            ...row,
                            cooldown: Number(event.target.value),
                          };
                          setSkillRows(next);
                        }}
                      />
                      <button
                        type="button"
                        className="self-start rounded-md border border-red-200 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                        disabled={isSubmitting}
                        onClick={() =>
                          setSkillRows((prev) =>
                            prev.filter((_, rowIndex) => rowIndex !== index),
                          )
                        }
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            onClick={isEditing ? handleCancelEditing : resetForm}
          >
            {isEditing ? "Cancelar edição" : "Limpar"}
          </button>
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Salvando..."
              : isEditing
                ? "Atualizar item"
                : "Salvar item"}
          </button>
        </div>
      </form>
    </section>
  );
}
