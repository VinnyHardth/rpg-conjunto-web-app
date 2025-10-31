"use client";

import { useItemsTables } from "../contexts/ItemsTablesContext";

export function ItemList() {
  const { items, loadingItems } = useItemsTables();

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

  if (!items || items.length === 0) {
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
          Visualize e consulte rapidamente o catálogo de itens disponíveis.
        </p>
      </header>

      <ul className="space-y-3">
        {items
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">Tipo: {item.itemType}</p>
                  {item.value != null && (
                    <p className="text-xs text-gray-500">
                      Valor base: {item.value}
                    </p>
                  )}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  ID {item.id}
                </span>
              </div>
              {item.description && (
                <p className="mt-2 text-xs text-gray-600">{item.description}</p>
              )}
            </li>
          ))}
      </ul>
    </section>
  );
}
