import { useEffect, useMemo, useState } from "react";
import type { ItemsDTO } from "@rpg/shared";

type AddInventoryItemDialogProps = {
  open: boolean;
  items: ItemsDTO[];
  isLoadingItems?: boolean;
  isSubmitting: boolean;
  onSubmit: (payload: { itemId: string; quantity: number }) => Promise<void>;
  onClose: () => void;
};

export default function AddInventoryItemDialog({
  open,
  items,
  isLoadingItems = false,
  isSubmitting,
  onSubmit,
  onClose,
}: AddInventoryItemDialogProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(normalizedQuery),
    );
  }, [items, searchTerm]);

  const hasItems = items.length > 0;
  const hasFilteredItems = filteredItems.length > 0;

  useEffect(() => {
    if (!open) return;

    setError(null);
    setQuantity(1);
    setSearchTerm("");
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (!hasFilteredItems) {
      setSelectedItemId("");
      return;
    }

    const isCurrentValid = filteredItems.some(
      (item) => item.id === selectedItemId,
    );
    if (!isCurrentValid) {
      setSelectedItemId(filteredItems[0].id);
    }
  }, [open, filteredItems, hasFilteredItems, selectedItemId]);

  const selectedItem = useMemo(() => {
    return items.find((item) => item.id === selectedItemId) ?? null;
  }, [items, selectedItemId]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Informe uma quantidade válida.");
      return;
    }

    if (!selectedItemId) {
      setError("Selecione um item válido.");
      return;
    }

    try {
      await onSubmit({ itemId: selectedItemId, quantity });
    } catch (err) {
      console.error("Falha ao adicionar item ao inventário:", err);
      setError("Não foi possível adicionar o item. Tente novamente.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-10">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <header className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Adicionar item ao inventário
          </h2>
          <p className="text-sm text-gray-500">
            Escolha um item cadastrado e defina a quantidade desejada.
          </p>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="item" className="text-sm font-medium text-gray-700">
              Item
            </label>
            <input
              type="search"
              placeholder="Pesquisar por nome"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              disabled={!hasItems || isSubmitting || isLoadingItems}
            />
            <select
              id="item"
              name="item"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={selectedItemId}
              disabled={!hasItems || isSubmitting || isLoadingItems}
              onChange={(event) => setSelectedItemId(event.target.value)}
            >
              {!hasFilteredItems && (
                <option value="">Nenhum item encontrado</option>
              )}
              {filteredItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            {!hasItems && (
              <p className="text-xs text-gray-500">
                Cadastre novos itens em <strong>Tabelas &gt; Itens</strong>.
              </p>
            )}
            {hasItems && !hasFilteredItems && (
              <p className="text-xs text-gray-500">
                Nenhum item corresponde à sua busca. Tente outro termo.
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="quantity"
              className="text-sm font-medium text-gray-700"
            >
              Quantidade
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              step={1}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={quantity}
              disabled={isSubmitting}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </div>

          {selectedItem && (
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
              <p className="font-semibold text-gray-700">Detalhes do item</p>
              {selectedItem.description && (
                <p className="mt-1">{selectedItem.description}</p>
              )}
              <p className="mt-1">
                Tipo:{" "}
                <span className="font-medium">{selectedItem.itemType}</span>
              </p>
              {selectedItem.value != null && (
                <p className="mt-1">
                  Valor padrão:{" "}
                  <span className="font-medium">{selectedItem.value}</span>
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!hasFilteredItems || isSubmitting}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Adicionando..." : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
