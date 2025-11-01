"use client";

import { createContext, type PropsWithChildren, useContext } from "react";

import type { AbilitiesDTO, AbilityEffectDTO, EffectDTO } from "@rpg/shared";
import type { KeyedMutator } from "swr";

import { useAbilitiesTablesData } from "../hooks/useAbilitiesTablesData";

type AbilitiesTablesContextValue = {
  abilities: AbilitiesDTO[] | undefined;
  abilitiesError: unknown;
  loadingAbilities: boolean;
  mutateAbilities: KeyedMutator<AbilitiesDTO[]>;
  abilityEffects: AbilityEffectDTO[] | undefined;
  abilityEffectsError: unknown;
  loadingAbilityEffects: boolean;
  mutateAbilityEffects: KeyedMutator<AbilityEffectDTO[]>;
  effects: EffectDTO[] | undefined;
  effectsError: unknown;
  loadingEffects: boolean;
};

const AbilitiesTablesContext =
  createContext<AbilitiesTablesContextValue | null>(null);

export function AbilitiesTablesProvider({ children }: PropsWithChildren) {
  const value = useAbilitiesTablesData();

  return (
    <AbilitiesTablesContext.Provider value={value}>
      {children}
    </AbilitiesTablesContext.Provider>
  );
}

export function useAbilitiesTables() {
  const context = useContext(AbilitiesTablesContext);
  if (!context) {
    throw new Error(
      "useAbilitiesTables deve ser usado dentro de AbilitiesTablesProvider",
    );
  }
  return context;
}
