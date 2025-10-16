"use client";

import React, { useState, useEffect } from "react";

import { useAttributes } from "@/hooks/useAttributes";
import type {
  Archetype,
  AttributeKey,
  CharacterAttribute,
} from "@/types/models";

import { SKILL_NAME_MAPPING, STATUS_NAMES, Status } from "@/types/models";

import {
  calculateExpertises,
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
const REVERSE_SKILL_MAPPING: Record<string, string> = Object.entries(
  SKILL_NAME_MAPPING,
).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {} as Record<string, string>,
);

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

  // Separar por kind
  const baseAttributes = allAttributes.filter(
    (attr) => attr.kind === "ATTRIBUTE",
  );
  const expertises = allAttributes.filter((attr) => attr.kind === "EXPERTISE");

  console.log("Base attributes:", baseAttributes);
  console.log("Expertises:", expertises);

  const handleEditStart = (attribute: (typeof allAttributes)[0]) => {
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

      // 3. Calcular novas perícias
      const newExpertises = calculateExpertises(attributeRecord);
      console.log("Novas perícias calculadas:", newExpertises);

      // 3.2 Calcular novo status
      const newStatus = calculateStatus(attributeRecord, archetype);
      console.log("Novo status calculado:", newStatus);

      // 4. Atualizar as perícias com os valores calculados
      const updatedExpertises: CharacterAttribute[] = expertises.map((exp) => {
        const skillKey = REVERSE_SKILL_MAPPING[exp.name];

        if (skillKey && newExpertises[skillKey as AttributeKey] !== undefined) {
          const calculatedValue = newExpertises[skillKey as AttributeKey];
          const originalExp = localAttributes.find(
            (a) => a.attributeId === exp.attributeId,
          );

          return {
            id: originalExp?.id || "",
            characterId: originalExp?.characterId || "",
            attributeId: exp.attributeId,
            valueBase: calculatedValue,
            valueInv: originalExp?.valueInv || 0,
            valueExtra: originalExp?.valueExtra || 0,
            createdAt: originalExp?.createdAt || new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          };
        }

        const originalExp = localAttributes.find(
          (a) => a.attributeId === exp.attributeId,
        );
        return originalExp || exp;
      });

      console.log("Perícias atualizadas:", updatedExpertises);

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

      // 5. Combinar todos os atributos
      const finalAttributes: CharacterAttribute[] = [
        ...updatedBaseAttributes.filter((attr) =>
          baseAttributes.some(
            (baseAttr) => baseAttr.attributeId === attr.attributeId,
          ),
        ),
        ...updatedExpertises,
      ];

      console.log("Atributos finais para update:", finalAttributes);

      // 6. Atualizar estado local E chamar callback
      setLocalAttributes(finalAttributes);
      onAttributesUpdate(finalAttributes);
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

  const AttributeRow = ({
    attribute,
    editable = false,
  }: {
    attribute: (typeof allAttributes)[0];
    editable?: boolean;
  }) => (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4 text-gray-800 font-medium">{attribute.name}</td>
      <td className="py-3 px-4 text-center">
        {editable && editingId === attribute.attributeId ? (
          <div className="flex items-center justify-center space-x-2">
            <input
              type="number"
              min="0"
              value={editValue}
              onChange={(e) => setEditValue(Number(e.target.value))}
              onKeyDown={handleKeyPress}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleEditSave}
              className="p-1 text-green-600 hover:text-green-800"
              title="Salvar"
            >
              ✓
            </button>
            <button
              onClick={handleEditCancel}
              className="p-1 text-red-600 hover:text-red-800"
              title="Cancelar"
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold cursor-pointer transition-colors ${
              editable
                ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                : "bg-blue-100 text-blue-800"
            }`}
            onClick={editable ? () => handleEditStart(attribute) : undefined}
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

  const TableSection = ({
    title,
    data,
    description,
    editable = false,
  }: {
    title: string;
    data: typeof allAttributes;
    description?: string;
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
                Base {editable && "(Clique para editar)"}
              </th>
              <th className="py-3 px-4 text-center text-gray-700 font-semibold">
                Bônus
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

      {/* Perícias - Apenas leitura */}
      <TableSection
        title="Perícias"
        data={expertises}
        description="Habilidades calculadas automaticamente a partir dos atributos"
      />

      {/* Resumo Estatístico */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Resumo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {baseAttributes.length}
            </div>
            <div className="text-sm text-gray-600">Atributos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {expertises.length}
            </div>
            <div className="text-sm text-gray-600">Perícias</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {baseAttributes.reduce((sum, attr) => sum + attr.valueBase, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Base</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {allAttributes.reduce(
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
