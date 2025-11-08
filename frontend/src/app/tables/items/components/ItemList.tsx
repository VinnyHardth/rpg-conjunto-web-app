"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import type { ItemsDTO } from "@rpg/shared";

import { deleteItem } from "@/lib/api";

import { useItemsTables } from "../contexts/ItemsTablesContext";

type ItemListProps = {
  items: ItemsDTO[];
  selectedItemId: string | null;
  onSelectItem: (item: ItemsDTO) => void;
  onItemDeleted: (itemId: string) => void;
};

export function ItemList({
  items,
  selectedItemId,
  onSelectItem,
  onItemDeleted,
}: ItemListProps) {
  const { loadingItems, mutateItems, mutateItemEffects } = useItemsTables();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(lowercasedQuery) ||
        (item.description &&
          item.description.toLowerCase().includes(lowercasedQuery)),
    );
  }, [items, searchQuery]);

  if (loadingItems) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">
          Itens cadastrados
        </h2>
        <p className="mt-2 text-sm text-gray-600">Carregando itens...</p>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">
          Itens cadastrados
        </h2>
        <p className="mt-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
          Nenhum item cadastrado até o momento.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <header className="mb-4 space-y-1">
        <h2 className="text-xl font-semibold text-gray-800">
          Itens cadastrados
        </h2>
        <p className="text-sm text-gray-500">
          Selecione um item para destacar e utilize a ação de exclusão quando
          necessário.
        </p>
        <div className="pt-2">
          <input
            type="text"
            placeholder="Buscar item por nome ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </header>

      <ul
        className="flex-1 space-y-3 overflow-y-auto pr-2"
        style={{ maxHeight: "calc(100vh - 18rem)" }}
      >
        {filteredItems.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-500">
            Nenhum item encontrado para sua busca.
          </p>
        )}
        {filteredItems
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((item) => {
            const isSelected = selectedItemId === item.id;

            return (
              <li key={item.id}>
                <div
                  onClick={() => onSelectItem(item)}
                  className={`flex w-full cursor-pointer items-start justify-between gap-3 rounded-lg border px-4 py-3 text-left shadow-sm transition ${
                    isSelected
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Tipo: {item.itemType}
                    </p>
                    {item.value != null && (
                      <p className="text-xs text-gray-500">
                        Valor base: {item.value}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-xs text-gray-600">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation(); // Impede que o clique selecione o item

                        const confirmed = window.confirm(
                          `Remover o item "${item.name}"? Esta ação é permanente.`,
                        );
                        if (!confirmed) return;

                        try {
                          setDeletingId(item.id);
                          await deleteItem(item.id);
                          await mutateItems(
                            (prev) =>
                              prev?.filter(
                                (existing) => existing.id !== item.id,
                              ) ?? [],
                            { revalidate: false },
                          );
                          await mutateItemEffects(
                            (prev) =>
                              prev?.filter(
                                (effect) => effect.itemId !== item.id,
                              ) ?? [],
                            { revalidate: false },
                          );
                          toast.success(`Item "${item.name}" removido.`);
                          onItemDeleted(item.id);
                        } catch (error) {
                          console.error("Falha ao remover item:", error);
                          toast.error("Não foi possível remover o item.");
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                      className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? "Removendo..." : "Excluir"}
                    </button>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      ID {item.id}
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
