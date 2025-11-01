"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ItemForm } from "./components/ItemForm";
import { ItemList } from "./components/ItemList";
import {
  ItemsTablesProvider,
  useItemsTables,
} from "./contexts/ItemsTablesContext";

function ItemsTablesContent() {
  const { items, itemsError, effectsError, itemEffectsError } =
    useItemsTables();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const activeItems = useMemo(
    () => (items ?? []).filter((item) => item.deletedAt == null),
    [items],
  );

  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return activeItems.find((item) => item.id === selectedItemId) ?? null;
  }, [activeItems, selectedItemId]);

  useEffect(() => {
    if (!selectedItemId) return;
    const stillExists = activeItems.some((item) => item.id === selectedItemId);
    if (!stillExists) {
      setSelectedItemId(null);
    }
  }, [activeItems, selectedItemId]);

  useEffect(() => {
    if (!itemsError) return;
    console.error("Falha ao carregar itens:", itemsError);
    toast.error("Não foi possível carregar a lista de itens.");
  }, [itemsError]);

  useEffect(() => {
    if (!effectsError) return;
    console.error("Falha ao carregar efeitos:", effectsError);
    toast.error("Não foi possível carregar a lista de efeitos.");
  }, [effectsError]);

  useEffect(() => {
    if (!itemEffectsError) return;
    console.error(
      "Falha ao carregar efeitos vinculados aos itens:",
      itemEffectsError,
    );
    toast.error("Não foi possível carregar os vínculos de efeitos dos itens.");
  }, [itemEffectsError]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">
          Cadastro de Itens
        </h1>
        <p className="text-sm text-gray-600">
          Registre novos itens que poderão ser vinculados a personagens nas
          campanhas.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <ItemForm
          selectedItem={selectedItem}
          onEditingCompleted={(itemId) => {
            setSelectedItemId(itemId);
          }}
        />
        <ItemList
          items={activeItems}
          selectedItemId={selectedItemId}
          onSelectItem={(item) => setSelectedItemId(item.id)}
          onItemDeleted={(itemId) => {
            setSelectedItemId((current) =>
              current === itemId ? null : current,
            );
          }}
        />
      </div>
    </div>
  );
}

export default function ItemsTablesPage() {
  return (
    <ItemsTablesProvider>
      <ItemsTablesContent />
    </ItemsTablesProvider>
  );
}
