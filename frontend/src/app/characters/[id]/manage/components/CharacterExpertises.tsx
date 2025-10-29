"use client";

import React, { useState, useEffect } from "react";
import AttributeRow, { AttributeRowData } from "./AttributeRow";
import { useAttributes } from "../hooks/useAttributes";
import type { CharacterAttribute } from "@/types/models";

interface CharacterExpertisesProps {
  attributes: CharacterAttribute[];
  onAttributesUpdate: (attributes: CharacterAttribute[]) => void;
}

const CharacterExpertises: React.FC<CharacterExpertisesProps> = ({
  attributes: localAttributes,
  onAttributesUpdate,
}) => {
  const { data: attributesData } = useAttributes();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [allCharacterAttributes, setAllCharacterAttributes] =
    useState<CharacterAttribute[]>(localAttributes);
  const [newExpertiseId, setNewExpertiseId] = useState<string>("");

  useEffect(() => {
    setAllCharacterAttributes(localAttributes);
  }, [localAttributes]);

  const handleEditStart = (attribute: AttributeRowData) => {
    setEditingId(attribute.attributeId);
    setEditValue(attribute.valueBase);
  };

  const handleEditSave = () => {
    if (editingId !== null) {
      const updatedAttributes = allCharacterAttributes.map((attr) =>
        attr.attributeId === editingId
          ? { ...attr, valueBase: editValue }
          : attr,
      );
      setAllCharacterAttributes(updatedAttributes);
      onAttributesUpdate(updatedAttributes);
      setEditingId(null);
    }
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

  const handleAddExpertise = () => {
    if (!newExpertiseId) return;

    const updatedAttributes = allCharacterAttributes.map((attr) =>
      attr.attributeId === newExpertiseId
        ? { ...attr, valueBase: 1 } // Inicia com valor 1
        : attr,
    );

    setAllCharacterAttributes(updatedAttributes);
    onAttributesUpdate(updatedAttributes);

    // Reseta o select
    setNewExpertiseId("");
  };

  if (!attributesData) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Carregando perícias...</div>
      </div>
    );
  }

  // Combinar dados com os valores atuais
  const allAttributes = attributesData.map((attribute) => {
    const charAttribute = allCharacterAttributes.find(
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

  // Separa as perícias que o personagem já tem das que ele pode adicionar
  const displayedExpertises = allAttributes
    .filter(
      (attr) =>
        attr.kind === "EXPERTISE" &&
        attr.valueBase + attr.valueInv + attr.valueExtra > 0,
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const availableExpertises = allAttributes
    .filter(
      (attr) =>
        attr.kind === "EXPERTISE" &&
        attr.valueBase + attr.valueInv + attr.valueExtra === 0,
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Perícias</h2>
        <p className="text-gray-600 text-sm ">
          Habilidades que podem ser aprimoradas. Clique no valor base para
          editar.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-gray-700 font-semibold">
                Nome
              </th>
              <th className="py-3 px-4 text-center text-gray-700 font-semibold">
                Base
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
            {displayedExpertises.map((attribute, index) => (
              <AttributeRow
                key={attribute.attributeId || index}
                attribute={attribute}
                editable={true}
                isEditing={editingId === attribute.attributeId}
                editValue={editValue}
                onEditValueChange={setEditValue}
                onEditStart={handleEditStart}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
                onKeyPress={handleKeyPress}
              />
            ))}
            {displayedExpertises.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-6">
                  Nenhuma perícia adicionada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Seção para adicionar nova perícia */}
      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Adicionar Nova Perícia
        </h3>
        <div className="flex items-center gap-4">
          <select
            value={newExpertiseId}
            onChange={(e) => setNewExpertiseId(e.target.value)}
            className="block w-full max-w-xs px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="" disabled>
              Selecione uma perícia...
            </option>
            {availableExpertises.map((exp) => (
              <option key={exp.attributeId} value={exp.attributeId}>
                {exp.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddExpertise}
            disabled={!newExpertiseId}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterExpertises;
