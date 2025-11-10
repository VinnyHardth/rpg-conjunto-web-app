"use client";

import AttributeRow, { AttributeRowData } from "./AttributeRow";
import React, { useState, useEffect, useMemo } from "react";

import { useAttributes } from "../hooks/useAttributes";
import {
  STATUS_NAMES,
  Status,
  Character,
  CharacterType,
} from "@/types/models";
import type { Archetype, CharacterAttribute } from "@/types/models";

import { calculateStatus } from "@/lib/characterCalculations";
import type { StatusCalculationResult } from "@rpg/shared";

interface CharacterAttributeProps {
  attributes: CharacterAttribute[];
  status: Status[];
  character: Character;
  archetype: Archetype | null;
  onAttributesUpdate: (attribute: CharacterAttribute) => void;
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
  character,
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

  const isNpc = character.type === CharacterType.NPC;

  // Transforma o array de status em um objeto para fácil acesso
  const statsObject = useMemo(() => {
    const statusMap: Record<string, number> = {};
    (status || []).forEach((s: Status) => {
      const key = s.name.toLowerCase().replace(/ /g, "").replace("í", "i");
      statusMap[key] = s.valueMax;
    });

    return {
      hp: statusMap["hp"] || 0,
      mp: statusMap["mp"] || 0,
      tp: statusMap["tp"] || 0,
      movimento: statusMap["movimento"] || 0,
      rf: statusMap["resistenciafisica"] || 0,
      rm: statusMap["resistenciamagica"] || 0,
    };
  }, [status]);

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
    if (editingId && editValue >= 0) {
      // Define um arquétipo padrão para garantir que `archetype` nunca seja nulo na chamada de cálculo.
      const archetypeForCalculation: Archetype = archetype || {
        id: "none-placeholder",
        name: "None",
        hp: 0,
        mp: 0,
        tp: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

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
          const equipBonus = attr.valueInv ?? 0;

          if (attr.attributeId === editingId) {
            acc[attr.name] = editValue + equipBonus;
          } else {
            const updatedAttr = updatedBaseAttributes.find(
              (a) => a.attributeId === attr.attributeId,
            );
            const baseValue = updatedAttr?.valueBase ?? attr.valueBase ?? 0;
            acc[attr.name] = baseValue + equipBonus;
          }
          return acc;
        },
        {},
      );

      console.log("Attribute record para cálculo:", attributeRecord);

      let updatedStatus: Status[] = [...status]; // Começa com o status atual

      // Apenas recalcula o status se NÃO for um NPC
      if (character.type !== CharacterType.NPC) {
        // 3.2 Calcular novo status
        const newStatus = calculateStatus(
          attributeRecord,
          archetypeForCalculation,
        );
        console.log("Novo status calculado:", newStatus);

        // 4.2 Atualizar o status
        updatedStatus = status.map((s) => {
          const statusKey = REVERSE_STATUS_MAPPING[s.name];

          if (statusKey) {
            const typedKey = statusKey as keyof StatusCalculationResult;
            const calculatedValue = newStatus[typedKey];
            if (typeof calculatedValue !== "number") {
              return s;
            }
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
      } else {
        console.log("Cálculo de status ignorado para NPC.");
      }

      console.log("Atributos finais para update:", updatedBaseAttributes);

      // Encontrar o atributo específico que foi alterado
      const attributeToUpdate = updatedBaseAttributes.find(
        (attr) => attr.attributeId === editingId,
      );

      // Atualizar estado local E chamar callback com o objeto alterado
      setLocalAttributes(updatedBaseAttributes);
      if (attributeToUpdate) onAttributesUpdate(attributeToUpdate);

      // Chama o update de status apenas se ele foi de fato recalculado
      if (character.type !== CharacterType.NPC) {
        onStatusUpdate(updatedStatus);
      }
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

      {/* Status Editáveis para NPCs */}
      {isNpc && (
        <EditableStatusDisplay
          stats={statsObject}
          fullStatus={status}
          onManualStatChange={onStatusUpdate}
        />
      )}
      {/* Resumo Estatístico */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Visão Geral
        </h3>
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

function EditableStatusDisplay({
  stats,
  fullStatus,
  onManualStatChange,
}: {
  stats: Record<string, number>;
  fullStatus: Status[];
  onManualStatChange: (status: Status[]) => void;
}) {
  const resources = [
    { key: "hp", label: "HP", value: stats.hp, color: "red", icon: "❤️" },
    { key: "mp", label: "MP", value: stats.mp, color: "blue", icon: "✨" },
    { key: "tp", label: "TP", value: stats.tp, color: "orange", icon: "⚡" },
    {
      key: "movimento",
      label: "Movimento",
      value: stats.movimento,
      unit: "m",
      color: "green",
      icon: "👟",
    },
    {
      key: "rf",
      label: "Resistência Física",
      value: stats.rf,
      color: "purple",
      icon: "🛡️",
    },
    {
      key: "rm",
      label: "Resistência Mágica",
      value: stats.rm,
      color: "pink",
      icon: "🔮",
    },
  ];

  const handleChange = (statKey: string, value: number) => {
    const updatedStatus = fullStatus.map((s) => {
      const key = s.name.toLowerCase().replace(/ /g, "").replace("í", "i");
      if (key === statKey) {
        const isAtMax = s.valueActual >= s.valueMax;
        return {
          ...s,
          valueMax: value,
          valueActual: isAtMax ? value : Math.min(s.valueActual, value),
        };
      }
      return s;
    });
    onManualStatChange(updatedStatus);
  };

  return (
    <div className="p-4 border border-teal-200 rounded-lg bg-teal-50">
      <h3 className="font-bold text-xl mb-3 text-teal-700 flex items-center">
        <span className="mr-2">❤️‍🔥</span> Status (Editável)
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {resources.map(({ key, label, value,  color, icon }) => (
          <div
            key={key}
            className={`bg-white border-l-4 border-${color}-500 p-3 rounded shadow-sm`}
          >
            <div className="text-sm font-semibold text-gray-500 flex items-center mb-1">
              {icon} {label}
            </div>
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(key, parseInt(e.target.value) || 0)}
              className={`w-full text-2xl font-extrabold text-${color}-800 bg-transparent focus:outline-none p-0`}
              placeholder="0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CharacterAttributes;
