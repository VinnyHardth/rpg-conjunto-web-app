import { useMemo } from "react";
import type {
  CharacterHasItemDTO,
  ItemsDTO,
  ItemType as ItemTypeLiteral,
} from "@rpg/shared";
import { ItemType } from "@/types/models";

type CharacterInventoryEquipmentProps = {
  inventory: CharacterHasItemDTO[] | undefined;
  onAddItem?: () => void;
  onEquipItem?: (item: CharacterHasItemDTO) => void;
  onUnequipItem?: (item: CharacterHasItemDTO) => void;
  itemsCatalog?: ItemsDTO[] | undefined;
  isProcessingEquipment?: boolean;
};

const formatSlotLabel = (slot: CharacterHasItemDTO["equipped_slot"]) => {
  if (!slot) return "Sem slot";

  const normalized = slot.replace(/_/g, " ").toLowerCase();
  return normalized.replace(/(^|\s)\w/g, (match) => match.toUpperCase());
};

export default function CharacterInventoryEquipment({
  inventory,
  onAddItem,
  onEquipItem,
  onUnequipItem,
  itemsCatalog,
  isProcessingEquipment = false,
}: CharacterInventoryEquipmentProps) {
  const items = inventory ?? [];
  const equipments = items.filter((item) => item.is_equipped);

  const equipmentBySlot = equipments.reduce(
    (acc, item) => {
      const slot = formatSlotLabel(item.equipped_slot);
      acc[slot] = acc[slot] ? [...acc[slot], item] : [item];
      return acc;
    },
    {} as Record<string, CharacterHasItemDTO[]>,
  );

  const itemNameLookup = useMemo(() => {
    if (!itemsCatalog) return new Map<string, string>();
    return new Map(itemsCatalog.map((item) => [item.id, item.name]));
  }, [itemsCatalog]);

  const resolveItemName = (item: CharacterHasItemDTO) => {
    if ((item as unknown as { item?: ItemsDTO }).item?.name) {
      return (item as unknown as { item?: ItemsDTO }).item!.name!;
    }
    return itemNameLookup.get(item.itemId) ?? `Item ${item.itemId}`;
  };

  const resolveItemType = (
    item: CharacterHasItemDTO,
  ): ItemTypeLiteral | null => {
    const embeddedType = (item as unknown as { item?: ItemsDTO }).item
      ?.itemType;
    if (embeddedType) return embeddedType as ItemTypeLiteral;
    const catalogType = itemsCatalog?.find(
      (entry) => entry.id === item.itemId,
    )?.itemType;
    return (catalogType as ItemTypeLiteral | undefined) ?? null;
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Inventário
              </h2>
              <p className="text-sm text-gray-500">
                Todos os itens carregados pelo personagem. Equipamentos podem
                ser equipados diretamente daqui.
              </p>
            </div>
            <button
              type="button"
              onClick={onAddItem}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
            >
              Adicionar item
            </button>
          </header>

          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              Nenhum item disponível no inventário.
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {items.map((item) => {
                const itemType = resolveItemType(item);
                return (
                  <li
                    key={item.id}
                    className={`rounded-lg border px-4 py-3 shadow-sm ${
                      item.is_equipped
                        ? "border-indigo-200 bg-indigo-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-800">
                          {resolveItemName(item)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Quantidade: {item.quantity}
                        </p>
                        {itemType && (
                          <p className="text-xs text-gray-500">
                            Tipo: {itemType}
                          </p>
                        )}
                        {itemType === ItemType.EQUIPPABLE && (
                          <p className="text-xs text-gray-500">
                            Slot: {formatSlotLabel(item.equipped_slot)}
                          </p>
                        )}
                        {item.value != null && (
                          <p className="text-xs text-gray-500">
                            Valor estimado: {item.value}
                          </p>
                        )}
                      </div>
                      {item.is_equipped && (
                        <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
                          Equipado
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.is_equipped ? (
                        <button
                          type="button"
                          onClick={() => onUnequipItem?.(item)}
                          disabled={isProcessingEquipment}
                          className="inline-flex items-center gap-1 rounded-md border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50"
                        >
                          Remover do personagem
                        </button>
                      ) : itemType === ItemType.EQUIPPABLE ? (
                        <button
                          type="button"
                          onClick={() => onEquipItem?.(item)}
                          disabled={isProcessingEquipment}
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                        >
                          Equipar
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Equipamentos
            </h2>
            <p className="text-sm text-gray-500">
              Visão rápida dos slots equipados atualmente no personagem.
            </p>
          </div>
        </header>

        {equipments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
            Nenhum equipamento equipado no momento.
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(equipmentBySlot).map(([slotLabel, slotItems]) => (
              <article
                key={slotLabel}
                className="rounded-lg border border-indigo-100 bg-white px-4 py-3 shadow-sm"
              >
                <header className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-indigo-700">
                    {slotLabel}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {slotItems.length} equipamento(s)
                  </span>
                </header>
                <ul className="mt-2 space-y-1">
                  {slotItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between text-xs text-gray-600"
                    >
                      <div>
                        {resolveItemName(item)} • Quantidade: {item.quantity}
                      </div>
                      <button
                        type="button"
                        onClick={() => onUnequipItem?.(item)}
                        disabled={isProcessingEquipment}
                        className="inline-flex items-center gap-1 rounded-md border border-indigo-200 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 transition hover:bg-indigo-50"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
