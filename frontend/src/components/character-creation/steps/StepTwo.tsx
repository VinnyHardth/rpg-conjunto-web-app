import AttributeInputs from "../AttributeInputs";
import ResourceDisplay from "../ResourceDisplay";
import SkillsDisplay from "../SkillsDisplay";
import ArchetypeSelector from "../ArchetypeSelector";
import { CharacterData, DerivedStats, Archetype } from "@/types/character";

interface StepTwoProps {
  characterData: CharacterData;
  derivedStats: DerivedStats;
  onDataChange: (section: "atributos", key: string, value: string | number) => void;
  onArchetypeSelect: (archetype: Archetype | null) => void;
}

export default function StepTwo({
  characterData,
  derivedStats,
  onDataChange,
  onArchetypeSelect,
}: StepTwoProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* COLUNA 1: INPUTS DE ATRIBUTOS */}
      <div className="p-4 border border-indigo-200 rounded-lg bg-indigo-50 h-full">
        <h3 className="font-bold text-xl mb-4 text-indigo-700 flex items-center">
          <span className="mr-2">📝</span> Defina seus 7 Atributos
        </h3>
        
        <AttributeInputs
          attributes={characterData.atributos}
          onAttributeChange={(attr, value) => onDataChange("atributos", attr, value)}
        />

        <ArchetypeSelector
          selectedArchetypeId={characterData.archetype.id}
          onSelectArchetype={onArchetypeSelect}
        />

        <p className="text-xs text-gray-500 mt-4">
          Altere os valores acima para ver o impacto em tempo real na coluna ao lado.
        </p>
      </div>

      {/* COLUNA 2: ESTATÍSTICAS CALCULADAS */}
      <div className="space-y-4">
        <ResourceDisplay derivedStats={derivedStats} />
        <SkillsDisplay derivedStats={derivedStats} />
      </div>
    </div>
  );
}