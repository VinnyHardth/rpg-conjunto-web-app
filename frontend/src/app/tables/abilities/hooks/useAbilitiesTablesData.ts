"use client";

import useSWR from "swr";

import { fetchAbilities, fetchAbilityEffects, fetchEffects } from "@/lib/api";
import type { AbilitiesDTO, AbilityEffectDTO, EffectDTO } from "@rpg/shared";

export function useAbilitiesTablesData() {
  const {
    data: abilities,
    error: abilitiesError,
    isLoading: loadingAbilities,
    mutate: mutateAbilities,
  } = useSWR<AbilitiesDTO[]>("abilities", fetchAbilities, {
    revalidateOnFocus: false,
  });

  const {
    data: abilityEffects,
    error: abilityEffectsError,
    isLoading: loadingAbilityEffects,
    mutate: mutateAbilityEffects,
  } = useSWR<AbilityEffectDTO[]>("ability-effects", fetchAbilityEffects, {
    revalidateOnFocus: false,
  });

  const {
    data: effects,
    error: effectsError,
    isLoading: loadingEffects,
  } = useSWR<EffectDTO[]>("effects", fetchEffects, {
    revalidateOnFocus: false,
  });

  return {
    abilities,
    abilitiesError,
    loadingAbilities,
    mutateAbilities,
    abilityEffects,
    abilityEffectsError,
    loadingAbilityEffects,
    mutateAbilityEffects,
    effects,
    effectsError,
    loadingEffects,
  };
}
