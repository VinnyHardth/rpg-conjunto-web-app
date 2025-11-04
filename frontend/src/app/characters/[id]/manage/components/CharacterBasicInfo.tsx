// app/characters/[id]/manage/components/CharacterBasicInfo.tsx
"use client";

import AvatarUpload from "@/components/character-creation/AvatarUpload";
import { Archetype, Character, GENEROS_MOCK } from "@/types/models";

import { CharacterBasicInfoUpdate } from "@rpg/shared";

interface CharacterBasicInfoProps {
  character: Character;
  archetype: Archetype | null;
  // RENOMEADO: onSave para onUpdate, para indicar que é uma atualização local
  onUpdate: (updates: CharacterBasicInfoUpdate) => void;
}

export default function CharacterBasicInfo({
  character,
  archetype,
  // RENOMEADO
  onUpdate,
}: CharacterBasicInfoProps) {
  const handleInputChange = (
    field: keyof CharacterBasicInfoUpdate,
    value: string | number | null,
  ) => {
    // Agora, apenas notificamos o componente pai sobre a mudança
    onUpdate({ [field]: value });
  };

  const handleAvatarChange = (url: string) => {
    onUpdate({ imageUrl: url });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Informações Básicas
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Detalhes fundamentais do seu personagem. As alterações são salvas
        automaticamente.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Coluna do Avatar */}
        <div className="md:col-span-1">
          <AvatarUpload
            imageUrl={character.imageUrl}
            onImageUrlChange={handleAvatarChange}
          />
        </div>

        {/* Coluna dos Campos de Informação */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome
            </label>
            <input
              type="text"
              value={character.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raça
            </label>
            <input
              type="text"
              value={character.race || ""}
              onChange={(e) => handleInputChange("race", e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idade
            </label>
            <div className="relative">
              <input
                type="number"
                value={character.age || ""}
                placeholder="0"
                onChange={(e) =>
                  handleInputChange(
                    "age",
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
                anos
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Altura (cm)
            </label>
            <div className="relative">
              <input
                type="number"
                value={character.height || ""}
                placeholder="0"
                onChange={(e) =>
                  handleInputChange(
                    "height",
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
                cm
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gênero
            </label>
            <select
              value={character.gender || ""}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="" disabled>
                Selecione
              </option>
              {GENEROS_MOCK.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dinheiro
            </label>
            <input
              type="number"
              value={character.money?.toString() || ""}
              onChange={(e) =>
                handleInputChange(
                  "money",
                  e.target.value ? parseFloat(e.target.value) : null,
                )
              }
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

        </div>
        <div className="sm:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas do Personagem
          </label>
          <textarea
            value={character.annotations || ""}
            onChange={(e) => handleInputChange("annotations", e.target.value)}
            rows={4}
            placeholder="História, personalidade, objetivos..."
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      {archetype && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-lg text-gray-800 mb-3">
            Arquétipo: <span className="text-blue-600">{archetype.name}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-white p-3 rounded-md border">
              <div className="text-xs text-red-600 font-bold">HP MOD</div>
              <div className="text-xl font-bold text-red-500">
                x{archetype.hp}
              </div>
            </div>
            <div className="bg-white p-3 rounded-md border">
              <div className="text-xs text-blue-600 font-bold">MP MOD</div>
              <div className="text-xl font-bold text-blue-500">
                x{archetype.mp}
              </div>
            </div>
            <div className="bg-white p-3 rounded-md border">
              <div className="text-xs text-green-600 font-bold">TP MOD</div>
              <div className="text-xl font-bold text-green-500">
                x{archetype.tp}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
