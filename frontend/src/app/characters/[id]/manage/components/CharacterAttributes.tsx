"use client";

import AttributeRow, { AttributeRowData } from "./AttributeRow";
import React, { useState, useEffect } from "react";

import { useAttributes } from "../hooks/useAttributes";
import type {
  Archetype,
  CharacterAttribute,
} from "@/types/models";

import { STATUS_NAMES, Status } from "@/types/models";

import {
  calculateStatus,
} from "@/lib/characterCalculations";

interface CharacterAttributeProps {
  attributes: CharacterAttribute[];
  status: Status[];
  archetype: Archetype | null;
  onAttributesUpdate: (attributes: CharacterAttribute[]) => void;
  onStatusUpdate: (status: Status[]) => void;
}

// Mapeamento reverso para encontrar a key pelo nome
const REVERSE_STATUS_MAPPING: Record<string, string> = Object.entries(
  STATUS_NAMES,
).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {} as Record<string, string>,
);

const CharacterAttributes: React.FC<CharacterAttributeProps> = ({
  attributes,
  status,
  archetype,
  onAttributesUpdate,
  onStatusUpdate,
}) => {
  const { data: attributesData } = useAttributes();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [localAttributes, setLocalAttributes] =
    useState<CharacterAttribute[]>(attributes);

  // Atualizar localAttributes quando attributes mudar
  useEffect(() => {
    setLocalAttributes(attributes);
  }, [attributes]);

  if (!attributesData) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Carregando atributos...</div>
      </div>
    );
  }

  // Combinar dados com os valores atuais - USANDO localAttributes
  const allAttributes = attributesData.map((attribute) => {
    const charAttribute = localAttributes.find(
      (a) => a.attributeId === attribute.id,
    );

    if (charAttribute) {
      return {
        ...charAttribute,
        name: attribute.name,
        kind: attribute.kind,
      };
    }

    return {
      id: "",
      characterId: "",
      attributeId: attribute.id,
      valueBase: 0,
      valueInv: 0,
      valueExtra: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      name: attribute.name,
      kind: attribute.kind,
    };
  });

  // Separar por kind e ordenar alfabeticamente
  const baseAttributes = allAttributes
    .filter((attr) => attr.kind === "ATTRIBUTE")
    .sort((a, b) => a.name.localeCompare(b.name));

  console.log("Base attributes:", baseAttributes);

  const handleEditStart = (attribute: AttributeRowData) => {
    setEditingId(attribute.attributeId);
    setEditValue(attribute.valueBase);
  };

  const handleEditSave = () => {
    if (editingId && editValue >= 0 && archetype) {
      console.log("Editando atributo:", editingId, "novo valor:", editValue);

      // 1. Atualizar apenas o atributo base que foi editado
      const updatedBaseAttributes = localAttributes.map((attr) =>
        attr.attributeId === editingId
          ? { ...attr, valueBase: editValue }
          : attr,
      );

      console.log("Base attributes atualizados:", updatedBaseAttributes);

      // 2. Criar record de atributos para cálculos
      const attributeRecord = baseAttributes.reduce<Record<string, number>>(
        (acc, attr) => {
          if (attr.attributeId === editingId) {
            acc[attr.name] = editValue;
          } else {
            const updatedAttr = updatedBaseAttributes.find(
              (a) => a.attributeId === attr.attributeId,
            );
            acc[attr.name] = updatedAttr?.valueBase || attr.valueBase;
          }
          return acc;
        },
        {},
      );

      console.log("Attribute record para cálculo:", attributeRecord);

      // 3.2 Calcular novo status
      const newStatus = calculateStatus(attributeRecord, archetype);
      console.log("Novo status calculado:", newStatus);

      // 4.2 Atualizar o status
      const updatedStatus: Status[] = status.map((s) => {
        const statusKey = REVERSE_STATUS_MAPPING[s.name];

        if (statusKey && newStatus[statusKey] !== undefined) {
          const calculatedValue = newStatus[statusKey];
          const originalStatus = status.find((a) => a.id === s.id);

          return {
            id: s.id || "",
            characterId: originalStatus?.characterId || "",
            name: s.name,
            valueMax: calculatedValue,
            valueBonus: originalStatus?.valueBonus || 0,
            // Lógica corrigida:
            // 1. Se o status estava no máximo, o valor atual se torna o novo máximo.
            // 2. Senão, mantém o valor atual, mas o limita ao novo máximo (caso o máximo tenha diminuído).
            valueActual:
              (originalStatus?.valueActual ?? 0) >=
              (originalStatus?.valueMax ?? 0)
                ? calculatedValue
                : Math.min(originalStatus?.valueActual ?? 0, calculatedValue),
            createdAt: originalStatus?.createdAt || new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          };
        }

        // Se o status não foi recalculado, apenas retorne o original.
        return s;
      });

      console.log("Status atualizado:", updatedStatus);

      console.log("Atributos finais para update:", updatedBaseAttributes);

      // 6. Atualizar estado local E chamar callback
      setLocalAttributes(updatedBaseAttributes);
      onAttributesUpdate(updatedBaseAttributes);
      onStatusUpdate(updatedStatus);
    }
    setEditingId(null);
    setEditValue(0);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSave();
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  const TableSection = ({
    title,
    data,
    description,
    editable = false,
  }: {
    title: string;
    data: typeof allAttributes;
    description: string;
    editable?: boolean;
  }) => (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        {description && <p className="text-gray-600 text-sm">{description}</p>}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-gray-700 font-semibold">
                Nome
              </th>
              <th className="py-3 px-4 text-center text-gray-700 font-semibold">
                Base {editable}
              </th>
              <th className="py-3 px-4 text-center text-gray-700 font-semibold">
                Equip. Bônus
              </th>
              <th className="py-3 px-4 text-center text-gray-700 font-semibold">
                Extra
              </th>
              <th className="py-3 px-4 text-center text-gray-700 font-semibold">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((attribute, index) => (
              <AttributeRow
                key={attribute.attributeId || index}
                attribute={attribute}
                editable={editable}
                isEditing={editingId === attribute.attributeId}
                editValue={editValue}
                onEditValueChange={setEditValue}
                onEditStart={handleEditStart}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
                onKeyPress={handleKeyPress}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Atributos Principais - Editáveis */}
      <TableSection
        title="Atributos Principais"
        data={baseAttributes}
        description="Características fundamentais do personagem - Clique nos valores base para editar"
        editable={true}
      />

      {/* Resumo Estatístico */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Visão Geral</h3>
        <div className="flex justify-around items-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {baseAttributes.length}
            </div>
            <div className="text-sm text-gray-600">Atributos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {baseAttributes.reduce((sum, attr) => sum + attr.valueBase, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Base</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {baseAttributes.reduce(
                (sum, attr) =>
                  sum + attr.valueBase + attr.valueInv + attr.valueExtra,
                0,
              )}
            </div>
            <div className="text-sm text-gray-600">Pontos Totais</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterAttributes;
