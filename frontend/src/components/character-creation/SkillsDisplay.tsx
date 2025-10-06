import { SKILL_KEYS, DerivedStats } from "@/types/character";

interface SkillsDisplayProps {
  derivedStats: DerivedStats;
}

export default function SkillsDisplay({ derivedStats }: SkillsDisplayProps) {
  return (
    <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
      <h3 className="font-bold text-xl mb-3 text-purple-700 flex items-center">
        <span className="mr-2">🧠</span> Perícias (Calculadas)
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {SKILL_KEYS.map((skill) => (
          <div key={skill} className="bg-white p-2 rounded-md border flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">{skill}:</label>
            <div className="text-lg font-bold text-purple-800 w-8 text-center">
              {derivedStats.pericias[skill]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}