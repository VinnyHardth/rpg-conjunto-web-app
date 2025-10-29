import AttributeInputs from "../AttributeInputs";
import ResourceDisplay from "../ResourceDisplay";
import ArchetypeSelector from "../ArchetypeSelector";
import { CreateFullCharacter, Archetype, Attributes } from "@/types/models";

interface StepTwoProps {
  characterData: CreateFullCharacter;
  derivedStats: {
    hp: number;
    mp: number;
    tp: number;
    movimento: number;
    rf: number;
    rm: number;
  };
  onDataChange: (
    section: "atributos",
    key: string,
    value: string | number,
  ) => void;
  onArchetypeSelect: (archetype: Archetype | null) => void;
  getAttributeValue: (attributeName: string) => number;
  attributes: Attributes[];
  expertises: Attributes[];
  attributeKeys: string[];
}

export default function StepTwo({
  characterData,
  derivedStats,
  onDataChange,
  onArchetypeSelect,
  getAttributeValue,
  attributeKeys,
}: StepTwoProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* COLUNA 1: INPUTS DE ATRIBUTOS */}
      <div className="p-4 border border-indigo-200 rounded-lg bg-indigo-50 h-full">
        <h3 className="font-bold text-xl mb-4 text-indigo-700 flex items-center">
          <span className="mr-2">📝</span> Defina seus {attributeKeys.length}{" "}
          Atributos
        </h3>

        <AttributeInputs
          attributeKeys={attributeKeys}
          getAttributeValue={getAttributeValue}
          onAttributeChange={(attr, value) =>
            onDataChange("atributos", attr, value)
          }
        />

        <ArchetypeSelector
          selectedArchetypeId={characterData.archetype.id}
          onSelectArchetype={onArchetypeSelect}
        />
      </div>

      {/* COLUNA 2: ESTATÍSTICAS CALCULADAS */}
      <div className="space-y-4">
        <ResourceDisplay derivedStats={derivedStats} />
      </div>
    </div>
  );
}
