"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { EffectForm } from "./components/EffectForm";
import { EffectList } from "./components/EffectList";
import {
  EffectsTablesProvider,
  useEffectsTables,
} from "./contexts/EffectsTablesContext";

function EffectsTablesContent() {
  const { effects, effectModifiers, effectsError, effectModifiersError } =
    useEffectsTables();
  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null);

  const activeEffects = useMemo(
    () => (effects ?? []).filter((effect) => effect.deletedAt == null),
    [effects],
  );

  const selectedEffect = useMemo(() => {
    if (!selectedEffectId) return null;
    return (
      activeEffects.find((effect) => effect.id === selectedEffectId) ?? null
    );
  }, [activeEffects, selectedEffectId]);

  const selectedEffectModifiers = useMemo(() => {
    if (!selectedEffectId || !effectModifiers) return [];
    return effectModifiers.filter(
      (modifier) => modifier.effectId === selectedEffectId,
    );
  }, [effectModifiers, selectedEffectId]);

  useEffect(() => {
    if (!effectsError) return;
    console.error("Falha ao carregar efeitos:", effectsError);
    toast.error("Não foi possível carregar a lista de efeitos.");
  }, [effectsError]);

  useEffect(() => {
    if (!effectModifiersError) return;
    console.error(
      "Falha ao carregar modificadores de efeito:",
      effectModifiersError,
    );
    toast.error("Não foi possível carregar os modificadores de efeitos.");
  }, [effectModifiersError]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">
          Cadastro de Efeitos
        </h1>
        <p className="text-sm text-gray-600">
          Centralize aqui os efeitos que podem ser aplicados por itens,
          habilidades ou status.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <EffectForm
          selectedEffect={selectedEffect}
          selectedEffectModifiers={selectedEffectModifiers}
          onEditingCompleted={(effectId) => setSelectedEffectId(effectId)}
        />
        <EffectList
          effects={activeEffects}
          selectedEffectId={selectedEffectId}
          onSelectEffect={(effect) => setSelectedEffectId(effect.id)}
          onEffectDeleted={(effectId) => {
            setSelectedEffectId((current) =>
              current === effectId ? null : current,
            );
          }}
        />
      </div>
    </div>
  );
}

export default function EffectsTablesPage() {
  return (
    <EffectsTablesProvider>
      <EffectsTablesContent />
    </EffectsTablesProvider>
  );
}
