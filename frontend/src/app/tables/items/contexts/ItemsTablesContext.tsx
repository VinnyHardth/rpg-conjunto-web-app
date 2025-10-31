"use client";

import { createContext, type PropsWithChildren, useContext } from "react";

import { useItemsTablesData } from "../hooks/useItemsTablesData";

import type { EffectDTO, ItemsDTO } from "@rpg/shared";
import type { KeyedMutator } from "swr";

type ItemsTablesContextValue = {
  items: ItemsDTO[] | undefined;
  itemsError: unknown;
  loadingItems: boolean;
  mutateItems: KeyedMutator<ItemsDTO[]>;
  effects: EffectDTO[] | undefined;
  effectsError: unknown;
  loadingEffects: boolean;
};

const ItemsTablesContext = createContext<ItemsTablesContextValue | null>(null);

export function ItemsTablesProvider({ children }: PropsWithChildren) {
  const value = useItemsTablesData();

  return (
    <ItemsTablesContext.Provider value={value}>
      {children}
    </ItemsTablesContext.Provider>
  );
}

export function useItemsTables() {
  const context = useContext(ItemsTablesContext);
  if (!context) {
    throw new Error(
      "useItemsTables deve ser usado dentro de ItemsTablesProvider",
    );
  }
  return context;
}
