// app/characters/[id]/manage/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useCharacterData } from "@/hooks/useCharacterData";
import toast from "react-hot-toast";
import CharacterBasicInfo from "./components/CharacterBasicInfo";
import CharacterAttributes from "./components/CharacterAttributes";

import {
  CharacterBasicInfoUpdate,
  FullCharacterData,
  CharacterDTO,
} from "@rpg/shared";

import { CharacterAttribute, Status } from "@/types/models";

import api from "@/lib/axios";
import { AxiosResponse } from "axios";

type ManagementTab =
  | "info"
  | "attributes"
  | "skills"
  | "inventory"
  | "equipment";

export default function CharacterManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [activeTab, setActiveTab] = useState<ManagementTab>("info");
  const { data, isLoading, error } = useCharacterData(id);
  const [originalCharacterData, setOriginalCharacterData] =
    useState<FullCharacterData | null>(null);
  const [localCharacterData, setLocalCharacterData] =
    useState<FullCharacterData | null>(null);
  const [pendingUpdates, setPendingUpdates] = useState<
    Partial<FullCharacterData>
  >({});

  useEffect(() => {
    if (data) {
      setLocalCharacterData(data);
      setOriginalCharacterData(data);
    }
  }, [data]);

  const handleBasicInfoUpdate = (updates: CharacterBasicInfoUpdate) => {
    setPendingUpdates(
      (prev): Partial<FullCharacterData> => ({
        ...prev,
        info: {
          ...(localCharacterData?.info as CharacterDTO), // Start with the full, current data
          ...prev.info,
          ...updates,
          id, // Ensure ID is always present and correct
        },
      }),
    );
    setLocalCharacterData((prevData) => {
      if (!prevData) return null; // Should not happen, but keeps type safety
      return {
        ...prevData,
        info: {
          ...prevData.info,
          ...updates,
        },
      };
    });
  };

  const handleAttributesUpdate = (updates: CharacterAttribute[]) => {
    setPendingUpdates((prev) => ({ ...prev, attributes: updates }));
    setLocalCharacterData((prevData) => {
      if (!prevData) return null; // Should not happen, but keeps type safety
      return {
        ...prevData,
        attributes: updates,
      };
    });
  };

  const handleStatusUpdate = (updates: Status[]) => {
    setPendingUpdates((prev) => ({ ...prev, status: updates }));
    setLocalCharacterData((prevData) => {
      if (!prevData) return null; // Should not happen, but keeps type safety
      return {
        ...prevData,
        status: updates,
      };
    });
  };

  const handleSave = async () => {
    if (!localCharacterData || Object.keys(pendingUpdates).length === 0) return;

    console.log("📝 Dados do personagem:", localCharacterData);
    console.log("📝 Atualizações pendentes:", pendingUpdates);

    try {
      const promises: Promise<AxiosResponse>[] = [];

      // 1️⃣ Atualiza personagem base
      if (pendingUpdates.info && Object.keys(pendingUpdates.info).length > 0) {
        // Sanitize the payload to send only allowed fields

        const {
          id: _charId,
          userId: _userId,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          deletedAt: _deletedAt,
          ...allowedUpdates
        } = pendingUpdates.info;

        // Ensure annotations is a string
        if (
          allowedUpdates.annotations === null ||
          allowedUpdates.annotations === undefined
        ) {
          allowedUpdates.annotations = "";
        }
        promises.push(api.put(`/characters/${id}`, allowedUpdates));
      }

      // 2️⃣ Atualiza atributos
      if (pendingUpdates.attributes && pendingUpdates.attributes.length > 0) {
        for (const attribute of pendingUpdates.attributes) {
          promises.push(
            api.put(`/characterattributes/${attribute.id}`, {
              valueBase: attribute.valueBase,
            }),
          );
        }
      }

      // 3️⃣ Atualiza status
      if (pendingUpdates.status && pendingUpdates.status.length > 0) {
        for (const status of pendingUpdates.status) {
          promises.push(
            api.put(`/status/${status.id}`, {
              valueMax: status.valueMax,
              valueActual: status.valueActual,
            }),
          );
        }
      }

      // // 4️⃣ Atualiza inventário
      // if (pendingUpdates.inventory && pendingUpdates.inventory.length > 0) {
      //   promises.push(api.put(`/characters/${id}/inventory`, pendingUpdates.inventory));
      // }

      // // 5️⃣ Atualiza skills
      // if (pendingUpdates.skills && pendingUpdates.skills.length > 0) {
      //   promises.push(api.put(`/characters/${id}/skills`, pendingUpdates.skills));
      // }

      if (promises.length === 0) {
        console.warn("⚠️ Nenhuma atualização pendente encontrada.");
        return;
      }

      // Executa todas as atualizações em paralelo
      const responses = await Promise.all(promises);
      console.log("✅ Atualizações realizadas com sucesso:", responses);

      // Atualiza o estado local com os dados retornados (se quiser)
      //const updatedData = responses.reduce((acc, res) => ({ ...acc, ...res.data }), {});

      setLocalCharacterData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          ...responses.reduce((acc, res) => ({ ...acc, ...res.data }), {}),
        };
      });
      setPendingUpdates({});
      toast.success("Personagem atualizado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao atualizar personagem:", error);
      toast.error("Erro ao salvar personagem.");
    }
  };

  const handleCancel = () => {
    if (originalCharacterData) {
      setLocalCharacterData(originalCharacterData);
    }
    setPendingUpdates({});
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!localCharacterData) {
    return <div>Character not found</div>;
  }

  const characterData = localCharacterData;

  const tabs = [
    { id: "info" as ManagementTab, name: "Informações Básicas", icon: "📝" },
    {
      id: "attributes" as ManagementTab,
      name: "Atributos & Perícias",
      icon: "💪",
    },
    { id: "skills" as ManagementTab, name: "Habilidades", icon: "✨" },
    { id: "inventory" as ManagementTab, name: "Inventário", icon: "🎒" },
    { id: "equipment" as ManagementTab, name: "Equipamentos", icon: "⚔️" },
  ];

  console.log("📝 Dados do personagem:", characterData);
  console.log("📝 Atualizações pendentes:", pendingUpdates);

  const hpStatus = characterData.status.find((s) => s.name === "HP");
  const mpStatus = characterData.status.find((s) => s.name === "MP");
  const tpStatus = characterData.status.find((s) => s.name === "TP");

  const hasPendingChanges = Object.keys(pendingUpdates).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Cabeçalho com botões de salvar/cancelar */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {characterData.info.name}
            </h1>
            <p className="text-gray-600">
              Geração {characterData.info.generation} •{" "}
              {characterData.info.race}
              {characterData.archetype && ` • ${characterData.archetype.name}`}
            </p>
          </div>

          <div className="text-right">
            <div className="flex gap-4 mt-2">
              <div className="text-red-600 font-semibold">
                HP: {hpStatus?.valueActual || 0}/{hpStatus?.valueMax || 0}
              </div>
              <div className="text-blue-600 font-semibold">
                MP: {mpStatus?.valueActual || 0}/{mpStatus?.valueMax || 0}
              </div>
              <div className="text-yellow-600 font-semibold">
                TP: {tpStatus?.valueActual || 0}/{tpStatus?.valueMax || 0}
              </div>
            </div>

            {hasPendingChanges && (
              <div className="flex gap-2 mt-4 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Salvar Alterações
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegação por abas */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <nav className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2 text-lg">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo da aba ativa */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === "info" && (
          <CharacterBasicInfo
            character={characterData.info}
            archetype={characterData.archetype}
            onUpdate={handleBasicInfoUpdate}
          />
        )}

        {activeTab === "attributes" && (
          <CharacterAttributes
            attributes={characterData.attributes}
            status={characterData.status}
            archetype={characterData.archetype}
            onAttributesUpdate={handleAttributesUpdate}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>
    </div>
  );
}
