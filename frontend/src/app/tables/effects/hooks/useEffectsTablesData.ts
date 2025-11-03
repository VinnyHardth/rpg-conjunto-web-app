"use client";

import useSWR from "swr";

import { fetchEffectModifiers, fetchEffects } from "@/lib/api";
import type { EffectDTO, EffectModifierDTO } from "@rpg/shared";

export function useEffectsTablesData() {
  const {
    data: effects,
    error: effectsError,
    isLoading: loadingEffects,
    mutate: mutateEffects,
  } = useSWR<EffectDTO[]>("effects", fetchEffects, {
    revalidateOnFocus: false,
  });

  const {
    data: effectModifiers,
    error: effectModifiersError,
    isLoading: loadingEffectModifiers,
    mutate: mutateEffectModifiers,
  } = useSWR<EffectModifierDTO[]>("effect-modifiers", fetchEffectModifiers, {
    revalidateOnFocus: false,
  });

  return {
    effects,
    effectsError,
    loadingEffects,
    mutateEffects,
    effectModifiers,
    effectModifiersError,
    loadingEffectModifiers,
    mutateEffectModifiers,
  };
}
