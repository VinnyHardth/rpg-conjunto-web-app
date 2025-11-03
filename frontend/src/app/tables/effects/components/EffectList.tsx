"use client";

import { EffectDTO, EffectModifierDTO } from "@rpg/shared";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useEffectsTables } from "../contexts/EffectsTablesContext";
import { deleteEffect } from "@/lib/api";

type EffectListProps = {
  effects: EffectDTO[];
  selectedEffectId: string | null;
  onSelectEffect: (effect: EffectDTO) => void;
  onEffectDeleted: (effectId: string) => void;
};

export function EffectList({
  effects,
  selectedEffectId,
  onSelectEffect,
  onEffectDeleted,
}: EffectListProps) {
  const {
    loadingEffects,
    effectModifiers,
    mutateEffects,
    mutateEffectModifiers,
  } = useEffectsTables();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const modifiersByEffect = useMemo(() => {
    const grouped = new Map<string, EffectModifierDTO[]>();
    (effectModifiers ?? []).forEach((modifier) => {
      const bucket = grouped.get(modifier.effectId);
      if (bucket) {
        bucket.push(modifier);
      } else {
        grouped.set(modifier.effectId, [modifier]);
      }
    });
    return grouped;
  }, [effectModifiers]);

  if (loadingEffects) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">
          Efeitos cadastrados
        </h2>
        <p className="mt-2 text-sm text-gray-600">Carregando efeitos...</p>
      </section>
    );
  }

  if (!effects || effects.length === 0) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">
          Efeitos cadastrados
        </h2>
        <p className="mt-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
          Nenhum efeito cadastrado até o momento.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <header className="mb-4 space-y-1">
        <h2 className="text-xl font-semibold text-gray-800">
          Efeitos cadastrados
        </h2>
        <p className="text-sm text-gray-500">
          Clique em um efeito para editar suas informações e modificadores.
        </p>
      </header>

      <ul className="space-y-3">
        {effects
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((effect) => {
            const isSelected = selectedEffectId === effect.id;
            const effectModifiersList = modifiersByEffect.get(effect.id) ?? [];

            return (
              <li key={effect.id}>
                <div
                  className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 shadow-sm transition ${
                    isSelected
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectEffect(effect)}
                    className="flex-1 text-left"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {effect.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Dano: {effect.damageType} • Acúmulo:{" "}
                        {effect.stackingPolicy}
                      </p>
                      <p className="text-xs text-gray-500">
                        Duração base:{" "}
                        {effect.baseDuration > 0
                          ? `${effect.baseDuration} turno(s)`
                          : "Instantâneo"}
                      </p>
                      {effect.description && (
                        <p className="text-xs text-gray-600">
                          {effect.description}
                        </p>
                      )}
                      {effect.removableBy && (
                        <p className="text-xs text-gray-500">
                          Removível por: {effect.removableBy}
                        </p>
                      )}
                      {effectModifiersList.length > 0 && (
                        <div className="rounded-md border border-dashed border-gray-300 bg-white px-3 py-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                            Modificadores ({effectModifiersList.length})
                          </p>
                          <ul className="mt-1 space-y-1">
                            {effectModifiersList.map((modifier) => (
                              <li
                                key={modifier.id}
                                className="text-[11px] text-gray-600"
                              >
                                {modifier.componentName} •{" "}
                                {modifier.componentType} •{" "}
                                {modifier.operationType}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </button>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      type="button"
                      onClick={async () => {
                        const confirmed = window.confirm(
                          `Remover o efeito "${effect.name}"? Esta ação é permanente.`,
                        );
                        if (!confirmed) return;

                        try {
                          setDeletingId(effect.id);
                          await deleteEffect(effect.id);
                          await mutateEffects(
                            (prev) =>
                              prev?.filter((item) => item.id !== effect.id) ??
                              [],
                            { revalidate: false },
                          );
                          await mutateEffectModifiers(
                            (prev) =>
                              prev?.filter(
                                (modifier) => modifier.effectId !== effect.id,
                              ) ?? [],
                            { revalidate: false },
                          );
                          toast.success(`Efeito "${effect.name}" removido.`);
                          onEffectDeleted(effect.id);
                        } catch (error) {
                          console.error("Falha ao remover efeito:", error);
                          toast.error("Não foi possível remover o efeito.");
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                      className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={deletingId === effect.id}
                    >
                      {deletingId === effect.id ? "Removendo..." : "Excluir"}
                    </button>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      ID {effect.id}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
      </ul>
    </section>
  );
}
