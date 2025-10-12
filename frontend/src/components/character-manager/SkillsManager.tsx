// app/characters/[id]/manage/components/SkillsManager.tsx
"use client";

import { useState } from "react";
import { SkillWithAbility, Abilities, CostType } from "@/types/character-management";

interface SkillsManagerProps {
  skills: SkillWithAbility[];
  characterId: string;
  onUpdate: (updates: any) => Promise<void>;
}

export default function SkillsManager({ skills, characterId, onUpdate }: SkillsManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [availableAbilities, setAvailableAbilities] = useState<Abilities[]>([]);
  const [selectedAbilityId, setSelectedAbilityId] = useState<string>("");

  // Buscar habilidades disponíveis do catálogo
  const fetchAvailableAbilities = async () => {
    try {
      const response = await api.get('/api/abilities');
      setAvailableAbilities(response.data);
    } catch (error) {
      console.error('Erro ao buscar habilidades:', error);
    }
  };

  const handleAddSkill = async () => {
    if (!selectedAbilityId) return;

    try {
      // Adiciona a habilidade ao personagem
      const response = await api.post('/api/skills', {
        characterId,
        abilityId: selectedAbilityId,
        useType: "ACTIVE",
        cooldown: 0,
      });

      const newSkill = response.data;
      
      // Atualização otimista
      await onUpdate({
        skills: [...skills, newSkill]
      });
      
      setIsCreating(false);
      setSelectedAbilityId("");
    } catch (error) {
      console.error('Erro ao adicionar habilidade:', error);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      await api.delete(`/api/skills/${skillId}`);
      
      // Atualização otimista
      await onUpdate({
        skills: skills.filter(skill => skill.id !== skillId)
      });
    } catch (error) {
      console.error('Erro ao remover habilidade:', error);
    }
  };

  const getCostDisplay = (ability: Abilities) => {
    switch (ability.cost_type) {
      case "MP": return `${ability.mp_cost} MP`;
      case "TP": return `${ability.tp_cost} TP`;
      case "HP": return `${ability.hp_cost} HP`;
      case "COMBINATION": return `MP:${ability.mp_cost} TP:${ability.tp_cost}`;
      default: return "Sem custo";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Habilidades</h2>
        <button
          onClick={() => {
            setIsCreating(true);
            fetchAvailableAbilities();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <span>+</span>
          Adicionar Habilidade
        </button>
      </div>

      {/* Modal de adição */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Adicionar Habilidade</h3>
            
            <select
              value={selectedAbilityId}
              onChange={(e) => setSelectedAbilityId(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Selecione uma habilidade</option>
              {availableAbilities.map(ability => (
                <option key={ability.id} value={ability.id}>
                  {ability.name}
                </option>
              ))}
            </select>

            {selectedAbilityId && (
              <div className="bg-gray-50 p-3 rounded mb-4">
                <h4 className="font-semibold">
                  {availableAbilities.find(a => a.id === selectedAbilityId)?.name}
                </h4>
                <p className="text-sm text-gray-600">
                  {availableAbilities.find(a => a.id === selectedAbilityId)?.description}
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  Custo: {getCostDisplay(availableAbilities.find(a => a.id === selectedAbilityId)!)}
                  {availableAbilities.find(a => a.id === selectedAbilityId)?.cooldown_value > 0 && 
                    ` • Cooldown: ${availableAbilities.find(a => a.id === selectedAbilityId)?.cooldown_value}`
                  }
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleAddSkill}
                disabled={!selectedAbilityId}
                className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
              >
                Adicionar
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid de habilidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <div key={skill.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-lg">{skill.ability.name}</h4>
              <button
                onClick={() => handleRemoveSkill(skill.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remover
              </button>
            </div>
            
            <p className="text-gray-600 text-sm mb-3">{skill.ability.description}</p>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>Custo: {getCostDisplay(skill.ability)}</span>
              <span>Tipo: {skill.useType}</span>
            </div>
            
            {skill.ability.cooldown_value > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Cooldown: {skill.cooldown}/{skill.ability.cooldown_value}
              </div>
            )}

            {/* Efeitos da habilidade */}
            {skill.ability.effects.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <h5 className="text-xs font-semibold text-gray-500 mb-1">Efeitos:</h5>
                {skill.ability.effects.map(effect => (
                  <div key={effect.id} className="text-xs text-gray-600">
                    • {effect.effect.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {skills.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">✨</div>
            <p>Nenhuma habilidade aprendida</p>
            <p className="text-sm">Adicione habilidades do catálogo</p>
          </div>
        )}
      </div>
    </div>
  );
}