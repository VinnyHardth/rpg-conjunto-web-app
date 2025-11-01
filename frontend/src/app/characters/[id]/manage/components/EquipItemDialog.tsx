import { useMemo } from "react";
import type { CharacterHasItemDTO } from "@rpg/shared";
import { EquipSlot } from "@/types/models";

type EquipItemDialogProps = {
  open: boolean;
  inventoryItem: CharacterHasItemDTO | null;
  itemName?: string;
  isSubmitting: boolean;
  selectedSlot: EquipSlot;
  onSelectSlot: (slot: EquipSlot) => void;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

const EQUIP_SLOT_OPTIONS = Object.values(EquipSlot);

const formatSlotLabel = (slot: EquipSlot) =>
  slot
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\w/g, (match) => match.toUpperCase());

export function EquipItemDialog({
  open,
  inventoryItem,
  itemName,
  isSubmitting,
  selectedSlot,
  onSelectSlot,
  onClose,
  onConfirm,
}: EquipItemDialogProps) {
  const availableSlots = useMemo(
    () => EQUIP_SLOT_OPTIONS.filter((slot) => slot !== EquipSlot.NONE),
    [],
  );

  if (!open || !inventoryItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-10">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <header className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Equipar item</h2>
          <p className="text-sm text-gray-500">
            Escolha o slot onde {itemName ?? "o item"} será equipado.
          </p>
        </header>

        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          <p>
            <span className="font-semibold text-gray-800">Item:</span>{" "}
            {itemName ?? inventoryItem.itemId}
          </p>
          <p>
            <span className="font-semibold text-gray-800">
              Quantidade disponível:
            </span>{" "}
            {inventoryItem.quantity}
          </p>
        </div>

        <div className="mt-4 space-y-2">
          <label
            htmlFor="equip-slot"
            className="text-sm font-medium text-gray-700"
          >
            Slot de equipamento
          </label>
          <select
            id="equip-slot"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={selectedSlot}
            disabled={isSubmitting}
            onChange={(event) => onSelectSlot(event.target.value as EquipSlot)}
          >
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {formatSlotLabel(slot)}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              void onConfirm();
            }}
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Equipando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
