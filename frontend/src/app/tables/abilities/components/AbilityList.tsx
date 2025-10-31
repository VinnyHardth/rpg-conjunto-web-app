"use client";

import type { AbilitiesDTO, AbilityEffectDTO, EffectDTO } from "@rpg/shared";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useAbilitiesTables } from "../contexts/AbilitiesTablesContext";
import { deleteAbility } from "@/lib/api";

type AbilityListProps = {
  abilities: AbilitiesDTO[];
  selectedAbilityId: string | null;
  onSelectAbility: (ability: AbilitiesDTO) => void;
  onAbilityDeleted: (abilityId: string) => void;
};

export function AbilityList({
  abilities,
  selectedAbilityId,
  onSelectAbility,
  onAbilityDeleted,
}: AbilityListProps) {
  const {
    loadingAbilities,
    abilityEffects,
    mutateAbilities,
    mutateAbilityEffects,
    effects,
  } = useAbilitiesTables();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const effectNameLookup = useMemo(() => {
    const lookup = new Map<string, string>();
    (effects ?? []).forEach((effect) => {
      if (effect.deletedAt == null) {
        lookup.set(effect.id, effect.name);
      }
    });
    return lookup;
  }, [effects]);

  const abilityEffectsByAbility = useMemo(() => {
    const grouped = new Map<string, AbilityEffectDTO[]>();
    (abilityEffects ?? []).forEach((abilityEffect) => {
      const bucket = grouped.get(abilityEffect.abilityId);
      if (bucket) {
        bucket.push(abilityEffect);
      } else {
        grouped.set(abilityEffect.abilityId, [abilityEffect]);
      }
    });
    return grouped;
  }, [abilityEffects]);

  if (loadingAbilities) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">
          Habilidades cadastradas
        </h2>
        <p className="mt-2 text-sm text-gray-600">Carregando habilidades...</p>
      </section>
    );
  }

  if (!abilities.length) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">
          Habilidades cadastradas
        </h2>
        <p className="mt-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
          Nenhuma habilidade cadastrada no momento.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <header className="mb-4 space-y-1">
        <h2 className="text-xl font-semibold text-gray-800">
          Habilidades cadastradas
        </h2>
        <p className="text-sm text-gray-500">
          Clique em uma habilidade para editar informações ou vincular efeitos.
        </p>
      </header>

      <ul className="space-y-3">
        {abilities
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((ability) => {
            const isSelected = ability.id === selectedAbilityId;
            const linkedEffects = (
              abilityEffectsByAbility.get(ability.id) ?? []
            ).filter((link) => link.deletedAt == null);
            const formattedCosts = [
              { label: "MP", value: ability.mp_cost },
              { label: "TP", value: ability.tp_cost },
              { label: "HP", value: ability.hp_cost },
            ]
              .filter((cost) => (cost.value ?? 0) > 0)
              .map((cost) => `${cost.label}:${cost.value}`)
              .join(" • ");

            return (
              <li key={ability.id}>
                <div
                  className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 shadow-sm transition ${
                    isSelected
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => onSelectAbility(ability)}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {ability.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Custo: {ability.cost_type}{" "}
                        {formattedCosts ? `• ${formattedCosts}` : ""}
                      </p>
                      <p className="text-xs text-gray-500">
                        Recarga: {ability.cooldown_value ?? 0} turno(s)
                      </p>
                      {ability.description && (
                        <p className="text-xs text-gray-600">
                          {ability.description}
                        </p>
                      )}
                      {linkedEffects.length > 0 && (
                        <div className="rounded-md border border-dashed border-gray-300 bg-white px-3 py-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                            Efeitos vinculados ({linkedEffects.length})
                          </p>
                          <ul className="mt-1 space-y-1">
                            {linkedEffects.map((link) => (
                              <li
                                key={link.id}
                                className="text-[11px] text-gray-600"
                              >
                                {effectNameLookup.get(link.effectId) ??
                                  link.effectId}
                                {link.formula
                                  ? ` • Fórmula: ${link.formula}`
                                  : ""}
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
                          `Remover a habilidade "${ability.name}"? Esta ação é permanente.`,
                        );
                        if (!confirmed) return;

                        try {
                          setDeletingId(ability.id);
                          await deleteAbility(ability.id);
                          await mutateAbilities(
                            (prev) =>
                              prev?.filter((item) => item.id !== ability.id) ??
                              [],
                            { revalidate: false },
                          );
                          await mutateAbilityEffects(
                            (prev) =>
                              prev?.filter(
                                (item) => item.abilityId !== ability.id,
                              ) ?? [],
                            { revalidate: false },
                          );
                          toast.success(
                            `Habilidade "${ability.name}" removida.`,
                          );
                          onAbilityDeleted(ability.id);
                        } catch (error) {
                          console.error("Falha ao remover habilidade:", error);
                          toast.error("Não foi possível remover a habilidade.");
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                      className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={deletingId === ability.id}
                    >
                      {deletingId === ability.id ? "Removendo..." : "Excluir"}
                    </button>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      ID {ability.id}
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
