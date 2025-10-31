"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { createItem, createItemEffect, createItemSkill } from "@/lib/api";
import { ItemType } from "@/types/models";
import type { ItemType as ItemTypeLiteral } from "@rpg/shared";

import { useItemsTables } from "../contexts/ItemsTablesContext";

type EffectRow = {
  effectId: string;
  formula: string;
};

type SkillRow = {
  abilityId: string;
  cooldown: number;
};

const ITEM_TYPE_OPTIONS = Object.values(ItemType ?? {});
const DEFAULT_ITEM_TYPE = (ITEM_TYPE_OPTIONS[0] ??
  "EQUIPPABLE") as ItemTypeLiteral;

export function ItemForm() {
  const { effects, loadingEffects, mutateItems } = useItemsTables();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [itemType, setItemType] = useState<ItemTypeLiteral>(DEFAULT_ITEM_TYPE);
  const [value, setValue] = useState<number>(0);
  const [effectRows, setEffectRows] = useState<EffectRow[]>([]);
  const [skillRows, setSkillRows] = useState<SkillRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEquippable = itemType === ItemType.EQUIPPABLE;
  const isConsumable = itemType === ItemType.CONSUMABLE;

  const canAddEffect = useMemo(() => {
    if (!effects || effects.length === 0) return false;
    return effects.some(
      (effect) => !effectRows.some((row) => row.effectId === effect.id),
    );
  }, [effects, effectRows]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setImageURL("");
    setItemType(DEFAULT_ITEM_TYPE);
    setValue(0);
    setEffectRows([]);
    setSkillRows([]);
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
      .map((row) => ({
        effectId: row.effectId,
        formula: row.formula.trim(),
      }));

    const sanitizedSkills = (skillRows ?? [])
      .filter((row) => row.abilityId.trim())
      .map((row) => ({
        abilityId: row.abilityId.trim(),
        cooldown:
          Number.isFinite(row.cooldown) && row.cooldown >= 0 ? row.cooldown : 0,
      }));

    setIsSubmitting(true);
    try {
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
    } catch (error) {
      console.error("Falha ao cadastrar item:", error);
      toast.error("Não foi possível cadastrar o item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <header className="mb-4 space-y-1">
        <h2 className="text-xl font-semibold text-gray-800">
          Informações do item
        </h2>
        <p className="text-sm text-gray-500">
          Defina os dados principais e os efeitos opcionais do novo item.
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
                    { effectId: "", formula: "" },
                  ])
                }
                disabled={!canAddEffect || isSubmitting}
              >
                Adicionar efeito
              </button>
            </header>

            {loadingEffects ? (
              <p className="text-xs text-indigo-700">Carregando efeitos...</p>
            ) : (effects?.length ?? 0) === 0 ? (
              <p className="rounded-md border border-dashed border-indigo-200 bg-white px-3 py-2 text-xs text-indigo-700">
                Cadastre efeitos no sistema para vinculá-los aos itens.
              </p>
            ) : effectRows.length === 0 ? (
              <p className="rounded-md border border-dashed border-indigo-200 bg-white px-3 py-2 text-xs text-indigo-700">
                Nenhum efeito adicionado.
              </p>
            ) : (
              <ul className="space-y-2">
                {effectRows.map((row, index) => (
                  <li
                    key={index}
                    className="rounded-lg border border-indigo-200 bg-white px-3 py-2"
                  >
                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                      <select
                        className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                        value={row.effectId}
                        disabled={isSubmitting}
                        onChange={(event) => {
                          const next = [...effectRows];
                          next[index] = {
                            ...row,
                            effectId: event.target.value,
                          };
                          setEffectRows(next);
                        }}
                      >
                        <option value="">Selecione um efeito</option>
                        {effects?.map((effect) => (
                          <option key={effect.id} value={effect.id}>
                            {effect.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Fórmula (opcional)"
                        className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                        value={row.formula}
                        disabled={isSubmitting}
                        onChange={(event) => {
                          const next = [...effectRows];
                          next[index] = { ...row, formula: event.target.value };
                          setEffectRows(next);
                        }}
                      />
                      <button
                        type="button"
                        className="self-start rounded-md border border-red-200 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                        disabled={isSubmitting}
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
                ))}
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
                disabled={isSubmitting}
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

            {skillRows.length === 0 ? (
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
            onClick={resetForm}
          >
            Limpar
          </button>
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar item"}
          </button>
        </div>
      </form>
    </section>
  );
}
