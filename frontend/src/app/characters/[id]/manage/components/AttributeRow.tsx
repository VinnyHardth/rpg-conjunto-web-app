"use client";

import { AttributeKind, DateTime } from "@rpg/shared";
import React from "react";

export interface AttributeRowData {
  id: string;
  characterId: string;
  attributeId: string;
  valueBase: number;
  valueInv: number;
  valueExtra: number;
  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt?: DateTime | null;
  name: string;
  kind: AttributeKind;
}

interface AttributeRowProps {
  attribute: AttributeRowData;
  editable?: boolean;
  isEditing?: boolean;
  editValue?: number;
  editValueMax?: number;
  onEditValueChange?: (value: number) => void;
  onEditStart?: (attribute: AttributeRowData) => void;
  onEditSave?: () => void;
  onEditCancel?: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}

const AttributeRow: React.FC<AttributeRowProps> = ({
  attribute,
  editable = false,
  isEditing = false,
  editValue = 0,
  editValueMax,
  onEditValueChange,
  onEditStart,
  onEditSave,
  onEditCancel,
  onKeyPress,
}) => (
  <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
    <td className="py-3 px-4 text-gray-800 font-medium">{attribute.name}</td>
    <td className="py-3 px-4 text-center">
      {editable && isEditing ? (
        <div className="flex items-center justify-center space-x-2">
          <input
            type="number"
            min="0"
            max={editValueMax}
            value={editValue}
            onChange={(e) => onEditValueChange?.(Number(e.target.value))}
            onKeyDown={onKeyPress}
            className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={onEditSave}
            className="p-1 text-green-600 hover:text-green-800"
            title="Salvar"
          >
            ✓
          </button>
          <button
            onClick={onEditCancel}
            className="p-1 text-red-600 hover:text-red-800"
            title="Cancelar"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
            editable
              ? "cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200"
              : "bg-blue-100 text-blue-800"
          }`}
          onClick={editable ? () => onEditStart?.(attribute) : undefined}
        >
          <span>{attribute.valueBase}</span>
          {editable && <span className="text-xs opacity-70">✏️</span>}
        </div>
      )}
    </td>
    <td className="py-3 px-4 text-center">
      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
        {attribute.valueInv}
      </span>
    </td>
    <td className="py-3 px-4 text-center">
      <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
        {attribute.valueExtra}
      </span>
    </td>
    <td className="py-3 px-4 text-center">
      <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
        {attribute.valueBase + attribute.valueInv + attribute.valueExtra}
      </span>
    </td>
  </tr>
);

export default AttributeRow;