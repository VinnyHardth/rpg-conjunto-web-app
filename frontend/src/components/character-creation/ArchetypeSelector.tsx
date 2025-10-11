"use client";

import React, { useState, useEffect } from "react";
import { fetchArchetypes } from "@/lib/api";
import { Archetype } from "@/types/models";

interface ArchetypeSelectorProps {
  onSelectArchetype: (archetype: Archetype | null) => void;
  selectedArchetypeId: string | null;
}

export default function ArchetypeSelector({
  onSelectArchetype,
  selectedArchetypeId,
}: ArchetypeSelectorProps) {
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArchetypes = async () => {
      try {
        setIsLoading(true);
        const data = await fetchArchetypes();
        setArchetypes(data);
      } catch (err) {
        console.error("Erro ao carregar arquétipos:", err);
        setError("Não foi possível carregar os arquétipos do servidor.");
      } finally {
        setIsLoading(false);
      }
    };
    loadArchetypes();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;

    if (!selectedId) {
      onSelectArchetype(null);
      return;
    }

    const selectedArchetype = archetypes.find((a) => a.id === selectedId);

    if (selectedArchetype) {
      onSelectArchetype(selectedArchetype);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <span className="animate-spin">🌀</span>
        <span>Carregando Arquétipos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        Erro: {error}
      </div>
    );
  }

  const selectedArchetype = archetypes.find(
    (a) => a.id === selectedArchetypeId,
  );

  return (
    <div className="space-y-2">
      <label
        htmlFor="archetype-select"
        className="block text-sm font-medium text-gray-700"
      >
        Selecione o Arquétipo:
      </label>

      <select
        id="archetype-select"
        value={selectedArchetypeId || ""}
        onChange={handleChange}
        disabled={archetypes.length === 0}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border bg-white focus:border-purple-500 focus:ring-purple-500 text-base"
      >
        <option value="" disabled>
          {archetypes.length === 0
            ? "Nenhum arquétipo disponível"
            : "--- Escolha um Arquétipo ---"}
        </option>

        {archetypes.map((archetype) => (
          <option key={archetype.id} value={archetype.id}>
            {archetype.name}
          </option>
        ))}
      </select>

      {selectedArchetype && (
        <div className="p-3 mt-2 bg-purple-50 border border-purple-200 rounded-lg text-sm">
          <p className="font-semibold text-purple-800">
            Estatísticas Base de {selectedArchetype.name}:
          </p>
          <p className="text-gray-700">
            HP: {selectedArchetype.hp} | MP: {selectedArchetype.mp} | TP:{" "}
            {selectedArchetype.tp}
          </p>
        </div>
      )}
    </div>
  );
}
