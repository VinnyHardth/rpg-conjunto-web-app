"use client";

import useSWR from "swr";

import { fetchEffects, fetchItemEffects, fetchItems } from "@/lib/api";

import type { EffectDTO, ItemHasEffectDTO, ItemsDTO } from "@rpg/shared";

export function useItemsTablesData() {
  const {
    data: items,
    error: itemsError,
    isLoading: loadingItems,
    mutate: mutateItems,
  } = useSWR<ItemsDTO[]>("items", fetchItems, {
    revalidateOnFocus: false,
  });

  const {
    data: effects,
    error: effectsError,
    isLoading: loadingEffects,
  } = useSWR<EffectDTO[]>("effects", fetchEffects, {
    revalidateOnFocus: false,
  });

  const {
    data: itemEffects,
    error: itemEffectsError,
    isLoading: loadingItemEffects,
    mutate: mutateItemEffects,
  } = useSWR<ItemHasEffectDTO[]>("item-effects", fetchItemEffects, {
    revalidateOnFocus: false,
  });

  return {
    items,
    itemsError,
    loadingItems,
    mutateItems,
    effects,
    effectsError,
    loadingEffects,
    itemEffects,
    itemEffectsError,
    loadingItemEffects,
    mutateItemEffects,
  };
}
