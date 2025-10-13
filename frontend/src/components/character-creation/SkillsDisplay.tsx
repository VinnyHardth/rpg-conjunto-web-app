import { Attributes, SKILL_NAME_MAPPING } from "@/types/models";

interface SkillsDisplayProps {
  derivedStats: {
    pericias: Record<string, number>;
  };
  expertises: Attributes[];
}

export default function SkillsDisplay({
  derivedStats,
  expertises,
}: SkillsDisplayProps) {
  return (
    <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
      <h3 className="font-bold text-xl mb-3 text-purple-700 flex items-center">
        <span className="mr-2">🧠</span> Perícias (Calculadas)
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(derivedStats.pericias).map(([skillKey, skillValue]) => {
          const skillName = SKILL_NAME_MAPPING[skillKey] || skillKey;
          const expertise = expertises.find((exp) => exp.name === skillName);

          return (
            <div
              key={skillKey}
              className="bg-white p-2 rounded-md border flex justify-between items-center"
            >
              <label className="text-sm font-medium text-gray-700">
                {expertise?.name || skillName}:
              </label>
              <div className="text-lg font-bold text-purple-800 w-8 text-center">
                {skillValue}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
