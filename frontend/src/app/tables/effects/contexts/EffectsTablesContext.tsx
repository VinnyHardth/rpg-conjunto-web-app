"use client";

import { createContext, type PropsWithChildren, useContext } from "react";

import type { EffectDTO, EffectModifierDTO } from "@rpg/shared";
import type { KeyedMutator } from "swr";

import { useEffectsTablesData } from "../hooks/useEffectsTablesData";

type EffectsTablesContextValue = {
  effects: EffectDTO[] | undefined;
  effectsError: unknown;
  loadingEffects: boolean;
  mutateEffects: KeyedMutator<EffectDTO[]>;
  effectModifiers: EffectModifierDTO[] | undefined;
  effectModifiersError: unknown;
  loadingEffectModifiers: boolean;
  mutateEffectModifiers: KeyedMutator<EffectModifierDTO[]>;
};

const EffectsTablesContext = createContext<EffectsTablesContextValue | null>(
  null,
);

export function EffectsTablesProvider({ children }: PropsWithChildren) {
  const value = useEffectsTablesData();

  return (
    <EffectsTablesContext.Provider value={value}>
      {children}
    </EffectsTablesContext.Provider>
  );
}

export function useEffectsTables() {
  const context = useContext(EffectsTablesContext);
  if (!context) {
    throw new Error(
      "useEffectsTables deve ser usado dentro de EffectsTablesProvider",
    );
  }
  return context;
}
