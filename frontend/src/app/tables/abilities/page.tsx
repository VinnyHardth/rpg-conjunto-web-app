"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { AbilityForm } from "./components/AbilityForm";
import { AbilityList } from "./components/AbilityList";
import {
  AbilitiesTablesProvider,
  useAbilitiesTables,
} from "./contexts/AbilitiesTablesContext";

function AbilitiesTablesContent() {
  const { abilities, abilityEffects, abilitiesError, abilityEffectsError } =
    useAbilitiesTables();
  const [selectedAbilityId, setSelectedAbilityId] = useState<string | null>(
    null,
  );

  const activeAbilities = useMemo(
    () => (abilities ?? []).filter((ability) => ability.deletedAt == null),
    [abilities],
  );

  const selectedAbility = useMemo(() => {
    if (!selectedAbilityId) return null;
    return (
      activeAbilities.find((ability) => ability.id === selectedAbilityId) ??
      null
    );
  }, [activeAbilities, selectedAbilityId]);

  const selectedAbilityEffects = useMemo(() => {
    if (!selectedAbilityId || !abilityEffects) return [];
    return abilityEffects.filter(
      (abilityEffect) =>
        abilityEffect.abilityId === selectedAbilityId &&
        abilityEffect.deletedAt == null,
    );
  }, [abilityEffects, selectedAbilityId]);

  useEffect(() => {
    if (!abilitiesError) return;
    console.error("Falha ao carregar habilidades:", abilitiesError);
    toast.error("Não foi possível carregar a lista de habilidades.");
  }, [abilitiesError]);

  useEffect(() => {
    if (!abilityEffectsError) return;
    console.error("Falha ao carregar efeitos vinculados:", abilityEffectsError);
    toast.error("Não foi possível carregar os efeitos vinculados.");
  }, [abilityEffectsError]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">
          Cadastro de Habilidades
        </h1>
        <p className="text-sm text-gray-600">
          Registre habilidades e associe efeitos existentes para uso em
          personagens.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <AbilityForm
          selectedAbility={selectedAbility}
          selectedAbilityEffects={selectedAbilityEffects}
          onEditingCompleted={(abilityId) => setSelectedAbilityId(abilityId)}
        />
        <AbilityList
          abilities={activeAbilities}
          selectedAbilityId={selectedAbilityId}
          onSelectAbility={(ability) => setSelectedAbilityId(ability.id)}
          onAbilityDeleted={(abilityId) => {
            setSelectedAbilityId((current) =>
              current === abilityId ? null : current,
            );
          }}
        />
      </div>
    </div>
  );
}

export default function AbilitiesTablesPage() {
  return (
    <AbilitiesTablesProvider>
      <AbilitiesTablesContent />
    </AbilitiesTablesProvider>
  );
}
